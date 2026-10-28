import React from 'react'
import { render } from '@testing-library/react-native'
import OperatorNavigator from './OperatorNavigator'

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children, ...props }: any) => {
      ;(globalThis as { operatorTabNavigatorProps?: any }).operatorTabNavigatorProps = props
      return <>{children}</>
    },
    Screen: () => null,
  }),
}))
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }))
jest.mock('react-i18next', () => ({ useTranslation: () => ({ i18n: { resolvedLanguage: 'es' } }) }))
jest.mock('react-native-safe-area-context', () => ({ SafeAreaInsetsContext: require('react').createContext({ top: 0, right: 0, bottom: 0, left: 0 }) }))
jest.mock('../theme/ThemeContext', () => ({ ThemeContext: require('react').createContext({ theme: { background: '#0F172A', tabBarBackground: '#151F32', divider: '#263244', primary: '#1565C0', textSecondary: '#DBE4F0' } }) }))
jest.mock('../features/operator/screens/AssignedServicesScreen', () => () => null)
jest.mock('../features/operator/screens/OperatorProfileScreen', () => () => null)
jest.mock('../features/notifications/screens/NotificationsScreen', () => () => null)
jest.mock('../components/notifications/NotificationTabIcon', () => () => null)

test('OperatorTabs pinta cada escena con el fondo opaco del tema', () => {
  render(<OperatorNavigator setIsLoggedIn={jest.fn()} />)

  const navigatorProps = (globalThis as { operatorTabNavigatorProps?: { sceneContainerStyle?: { backgroundColor?: string }; detachInactiveScreens?: boolean } }).operatorTabNavigatorProps
  const sceneStyle = navigatorProps?.sceneContainerStyle
  expect(sceneStyle).toEqual({ backgroundColor: '#0F172A' })
  expect(navigatorProps?.detachInactiveScreens).toBe(false)
})
