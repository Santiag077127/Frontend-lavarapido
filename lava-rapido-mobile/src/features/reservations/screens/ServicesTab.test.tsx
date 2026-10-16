/// <reference types="jest" />
import React from 'react'
import { render } from '@testing-library/react-native'
import TabNavigator from '../../../navigation/TabNavigator'
import { paymentCopy } from '../../../i18n/paymentCopy'

jest.mock('@react-navigation/bottom-tabs', () => ({ createBottomTabNavigator: () => ({ Navigator: ({ children, ...props }: any) => { (globalThis as { tabNavigatorProps?: any }).tabNavigatorProps = props; return <>{children}</> }, Screen: ({ name, ...props }: any) => { ((globalThis as { tabScreenProps?: Record<string, any> }).tabScreenProps ??= {})[name] = props; return name === 'Mis servicios' || name === 'Reservas' ? require('react').createElement(require('react-native').Text, null, name) : null } }) }))
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }))
jest.mock('react-i18next', () => ({ useTranslation: () => ({ i18n: { resolvedLanguage: 'es' } }) }))
jest.mock('../../../theme/ThemeContext', () => ({ ThemeContext: require('react').createContext({ theme: { background: '#0F172A', tabBarBackground: '#151F32', divider: '#263244', card: '#151F32', border: '#263244', primary: '#1565C0', textSecondary: '#DBE4F0' }, darkMode: true }) }))
jest.mock('../../../features/home/screens/HomeScreen', () => () => null)
jest.mock('../../../features/profile/screens/ProfileScreen', () => () => null)
jest.mock('../../../features/map/screens/MapScreen', () => () => null)
jest.mock('../../../features/profile/screens/MyServicesScreen', () => () => null)
jest.mock('../../../features/notifications/screens/NotificationsScreen', () => () => null)

test('MainTabs registra Mis servicios y no expone la antigua pantalla Reservas', () => {
  const view = render(<TabNavigator isLoggedIn setIsLoggedIn={jest.fn()} />)
  expect(view.getByText('Mis servicios')).toBeTruthy()
  expect(view.queryByText('Reservas')).toBeNull()
})

test('MainTabs pinta cada escena con el fondo opaco del tema', () => {
  const navigatorProps = (globalThis as { tabNavigatorProps?: { sceneContainerStyle?: { backgroundColor?: string }; detachInactiveScreens?: boolean } }).tabNavigatorProps
  const sceneStyle = navigatorProps?.sceneContainerStyle
  expect(sceneStyle).toEqual({ backgroundColor: '#0F172A' })
  expect(navigatorProps?.detachInactiveScreens).toBe(false)
})

test('Inicio se desmonta al abandonar la pestaña para que no pueda componerse detrás de otra escena', () => {
  const homeOptions = (globalThis as { tabScreenProps?: Record<string, { options?: { unmountOnBlur?: boolean } }> }).tabScreenProps?.Home?.options
  expect(homeOptions?.unmountOnBlur).toBe(true)
})

test('las acciones posteriores al pago están traducidas en todos los idiomas', () => {
  for (const language of ['es', 'en', 'pt', 'fr'] as const) {
    expect(paymentCopy[language].paymentFlow.approvedTitle).toBeTruthy()
    expect(paymentCopy[language].paymentFlow.approvedMessage).toBeTruthy()
    expect(paymentCopy[language].paymentFlow.myServices).toBeTruthy()
    expect(paymentCopy[language].paymentFlow.goHome).toBeTruthy()
  }
})
