/// <reference types="jest" />
import React from 'react'
import { render } from '@testing-library/react-native'
import TabNavigator from '../../../navigation/TabNavigator'
import { paymentCopy } from '../../../i18n/paymentCopy'

jest.mock('@react-navigation/bottom-tabs', () => ({ createBottomTabNavigator: () => ({ Navigator: ({ children }: any) => <>{children}</>, Screen: ({ name }: any) => name === 'Mis servicios' || name === 'Reservas' ? require('react').createElement(require('react-native').Text, null, name) : null }) }))
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }))
jest.mock('react-i18next', () => ({ useTranslation: () => ({ i18n: { resolvedLanguage: 'es' } }) }))
jest.mock('../../../theme/ThemeContext', () => ({ ThemeContext: require('react').createContext({ theme: { card: '#fff', border: '#ddd', primary: '#2563EB', textSecondary: '#64748B' }, darkMode: false }) }))
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

test('las acciones posteriores al pago están traducidas en todos los idiomas', () => {
  for (const language of ['es', 'en', 'pt', 'fr'] as const) {
    expect(paymentCopy[language].paymentFlow.approvedTitle).toBeTruthy()
    expect(paymentCopy[language].paymentFlow.approvedMessage).toBeTruthy()
    expect(paymentCopy[language].paymentFlow.myServices).toBeTruthy()
    expect(paymentCopy[language].paymentFlow.goHome).toBeTruthy()
  }
})
