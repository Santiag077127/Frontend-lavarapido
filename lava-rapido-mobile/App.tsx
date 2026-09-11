import React, { useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import AppNavigator from './src/navigation/AppNavigator'
import { ThemeProvider } from './src/theme/ThemeContext'
import { NotificationProvider } from './src/components/notifications/NotificationProvider'
import type { UserRole } from './src/services/authService'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [role, setRole] = useState<UserRole | null>(null)

  const handleLoggedInChange = (value: boolean) => {
    setIsLoggedIn(value)

    if (!value) {
      setRole(null)
    }
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NotificationProvider>
          <NavigationContainer>
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
