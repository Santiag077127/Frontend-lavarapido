import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AppState, Linking, StatusBar } from 'react-native'
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import AppNavigator from './src/navigation/AppNavigator'
import { ThemeProvider } from './src/theme/ThemeContext'
import { NotificationProvider } from './src/components/notifications/NotificationProvider'
import type { UserRole } from './src/services/authService'
import { initializeLanguage } from './src/i18n'
import { setLogoutHandler, setToken } from './src/services/api'
import { userService } from './src/services/userService'
import { clearAuthSession, loadAuthSession } from './src/services/authSession'
import { pendingCheckoutRecovery } from './src/services/pendingCheckoutRecovery'
import { appAlert } from './src/components/notifications/NotificationProvider'
import i18n from './src/i18n'
import type { RootStackParamList } from './src/navigation/types'
import { clearLastPushResponse, deactivatePush, registerPush, subscribeToPushResponses } from './src/services/pushNotifications'
import { extractPasswordResetToken } from './src/services/passwordResetLink'
import { ThemeContext } from './src/theme/ThemeContext'

type AppNavigationProps = {
  navigationRef: ReturnType<typeof useNavigationContainerRef<RootStackParamList>>
  navigationReady: () => void
  isLoggedIn: boolean
  setIsLoggedIn: (value: boolean) => void
  role: UserRole | null
  setRole: (role: UserRole) => void
}

function AppNavigation({
  navigationRef,
  navigationReady,
  isLoggedIn,
  setIsLoggedIn,
  role,
  setRole,
}: AppNavigationProps) {
  const { darkMode, theme } = useContext(ThemeContext)

  return (
    <>
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
        translucent={false}
      />
      <NavigationContainer
        ref={navigationRef}
        onReady={navigationReady}
        theme={{
          dark: darkMode,
          colors: {
            primary: theme.primary,
            background: theme.background,
            card: theme.tabBarBackground,
            text: theme.text,
            border: theme.border,
            notification: theme.error,
          },
        }}
      >
        <AppNavigator
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          role={role}
          setRole={setRole}
        />
      </NavigationContainer>
    </>
  )
}

export default function App() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [role, setRole] = useState<UserRole | null>(null)
  const [languageReady, setLanguageReady] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [navigationReady, setNavigationReady] = useState(false)
  const [pendingResetToken, setPendingResetToken] = useState<string | null>(null)
  const identityRefresh = useRef(false)
  const recoveryInProgress = useRef(false)
  const lastResetUrl = useRef<string | null>(null)
  const authOperation = useRef(0)
  const restoredIdentityUserId = useRef<string | null | undefined>(undefined)

  const refreshIdentity = useCallback(async () => {
    if (identityRefresh.current) return null
    identityRefresh.current = true
    try {
      const current = await userService.getCurrent()
      setRole(current.role)
      return current
    } catch {
      // The API interceptor handles 401. A 403 keeps the current session intact.
      return null
    } finally {
      identityRefresh.current = false
    }
  }, [])

  const recoverPendingCheckouts = useCallback(async () => {
    if (!isLoggedIn || recoveryInProgress.current) return
    recoveryInProgress.current = true
    try {
      const restoredUserId = restoredIdentityUserId.current
      if (restoredUserId !== undefined) {
        restoredIdentityUserId.current = undefined
        if (restoredUserId) await pendingCheckoutRecovery.recover(restoredUserId)
        return
      }

      const current = await refreshIdentity()
      if (current) await pendingCheckoutRecovery.recover(current.userId)
    } finally {
      recoveryInProgress.current = false
    }
  }, [isLoggedIn, refreshIdentity])

  const handleLoggedInChange = useCallback((value: boolean) => {
    authOperation.current += 1
    setIsLoggedIn(value)

    if (!value) {
      void deactivatePush().catch(() => {})
      setToken(null)
      setRole(null)
      setAuthReady(true)
      void clearAuthSession().catch(() => {
        appAlert.alert(i18n.t('profile.errorTitle'), 'No fue posible cerrar la sesión de forma segura.')
      })
    }
  }, [])

  useEffect(() => {
    let active = true
    const operation = ++authOperation.current

    const restoreSession = async () => {
      const session = await loadAuthSession()
      if (!active || operation !== authOperation.current) return

      if (!session) {
        setAuthReady(true)
        return
      }

      setToken(session.token)

      try {
        const current = await userService.getCurrent()
        if (!active || operation !== authOperation.current) return

        setRole(current.role)
        restoredIdentityUserId.current = current.userId
        setIsLoggedIn(true)
      } catch (error: any) {
        if (!active || operation !== authOperation.current) return

        if (error?.response?.status === 401) {
          setToken(null)
          setRole(null)
          await clearAuthSession().catch(() => {})
          setIsLoggedIn(false)
        } else {
          // A temporary network failure does not invalidate an unexpired local session.
          restoredIdentityUserId.current = null
          setRole(session.role)
          setIsLoggedIn(true)
        }
      } finally {
        if (active && operation === authOperation.current) setAuthReady(true)
      }
    }

    void restoreSession()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    setLogoutHandler(() => {
      handleLoggedInChange(false)
      appAlert.alert(i18n.t('profile.sessionExpired'), i18n.t('profile.loginAgain'))
    })
    return () => setLogoutHandler(null)
  }, [handleLoggedInChange])

  useEffect(() => {
    if (isLoggedIn) void recoverPendingCheckouts()
  }, [isLoggedIn, recoverPendingCheckouts])

  useEffect(() => {
    if (!pendingResetToken || isLoggedIn || !navigationReady) return
    navigationRef.navigate('ResetPassword', { token: pendingResetToken })
    setPendingResetToken(null)
  }, [isLoggedIn, navigationReady, navigationRef, pendingResetToken])

  useEffect(() => {
    if (!languageReady) return

    const openPasswordReset = (url: string) => {
      if (url === lastResetUrl.current) return

      const result = extractPasswordResetToken(
        url,
        process.env.EXPO_PUBLIC_PASSWORD_RESET_URL,
      )
      lastResetUrl.current = url

      if (!result.valid) {
        appAlert.alert(i18n.t('forgotPassword.errorTitle'), i18n.t('accessibility.resetError'), undefined, 'error')
        return
      }

      if (isLoggedIn) handleLoggedInChange(false)
      setPendingResetToken(result.token)
    }

    void Linking.getInitialURL().then((url) => {
      if (url) openPasswordReset(url)
    }).catch(() => {})
    const subscription = Linking.addEventListener('url', ({ url }) => openPasswordReset(url))
    return () => subscription.remove()
  }, [isLoggedIn, languageReady])

  useEffect(() => {
    if (isLoggedIn) void registerPush().catch(() => {})
  }, [isLoggedIn])

  useEffect(() => {
    const openInbox = () => {
      if (!isLoggedIn || !navigationRef.isReady()) return
      if (role === 'OPERATOR') navigationRef.navigate('OperatorTabs', { screen: 'Notificaciones' })
      else navigationRef.navigate('MainTabs', { screen: 'Notificaciones' })
      clearLastPushResponse()
    }
    return subscribeToPushResponses(openInbox)
  }, [isLoggedIn, role, navigationRef])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isLoggedIn) {
        void recoverPendingCheckouts()
        void registerPush().catch(() => {})
      }
    })
    return () => subscription.remove()
  }, [isLoggedIn, recoverPendingCheckouts])

  useEffect(() => {
    initializeLanguage().finally(() => setLanguageReady(true))
  }, [])

  if (!languageReady || !authReady) {
    return null
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NotificationProvider isLoggedIn={isLoggedIn}>
          <AppNavigation
            navigationRef={navigationRef}
            navigationReady={() => setNavigationReady(true)}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={handleLoggedInChange}
            role={role}
            setRole={setRole}
          />
        </NotificationProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
