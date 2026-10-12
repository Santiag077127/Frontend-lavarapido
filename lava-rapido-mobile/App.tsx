import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native'
import * as Notifications from 'expo-notifications'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import AppNavigator from './src/navigation/AppNavigator'
import { ThemeProvider } from './src/theme/ThemeContext'
import { NotificationProvider } from './src/components/notifications/NotificationProvider'
import type { UserRole } from './src/services/authService'
import { initializeLanguage } from './src/i18n'
import { setLogoutHandler, setToken } from './src/services/api'
import { userService } from './src/services/userService'
import { appAlert } from './src/components/notifications/NotificationProvider'
import i18n from './src/i18n'
import type { RootStackParamList } from './src/navigation/types'
import { registerPush, deactivatePush } from './src/services/pushNotifications'

export default function App() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [role, setRole] = useState<UserRole | null>(null)
  const [languageReady, setLanguageReady] = useState(false)
  const identityRefresh = useRef(false)

  const refreshIdentity = useCallback(async () => {
    if (identityRefresh.current) return
    identityRefresh.current = true
    try {
      const current = await userService.getCurrent()
      setRole(current.role)
    } catch {
      // The API interceptor handles 401. A 403 keeps the current session intact.
    } finally {
      identityRefresh.current = false
    }
  }, [])

  useEffect(() => {
    setLogoutHandler(() => {
      setToken(null)
      setIsLoggedIn(false)
      setRole(null)
      appAlert.alert(i18n.t('profile.sessionExpired'), i18n.t('profile.loginAgain'))
    })
    return () => setLogoutHandler(() => {})
  }, [])

  useEffect(() => {
    if (isLoggedIn) void refreshIdentity()
  }, [isLoggedIn, refreshIdentity])

  useEffect(() => {
    if (isLoggedIn) void registerPush().catch(() => {})
  }, [isLoggedIn])

  useEffect(() => {
    const openInbox = () => {
      if (!isLoggedIn || !navigationRef.isReady()) return
      if (role === 'OPERATOR') navigationRef.navigate('OperatorTabs', { screen: 'Notificaciones' })
      else navigationRef.navigate('MainTabs', { screen: 'Notificaciones' })
      Notifications.clearLastNotificationResponse()
    }
    const subscription = Notifications.addNotificationResponseReceivedListener(openInbox)
    const last = Notifications.getLastNotificationResponse()
    if (last) openInbox()
    return () => subscription.remove()
  }, [isLoggedIn, role, navigationRef])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isLoggedIn) {
        void refreshIdentity()
        void registerPush().catch(() => {})
      }
    })
    return () => subscription.remove()
  }, [isLoggedIn, refreshIdentity])

  useEffect(() => {
    initializeLanguage().finally(() => setLanguageReady(true))
  }, [])

  const handleLoggedInChange = (value: boolean) => {
    setIsLoggedIn(value)

    if (!value) {
      void deactivatePush().catch(() => {})
      setToken(null)
      setRole(null)
    }
  }

  if (!languageReady) {
    return null
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NotificationProvider>
          <NavigationContainer ref={navigationRef}>
            <AppNavigator
              isLoggedIn={isLoggedIn}
              setIsLoggedIn={handleLoggedInChange}
              role={role}
              setRole={setRole}
            />
          </NavigationContainer>
        </NotificationProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
