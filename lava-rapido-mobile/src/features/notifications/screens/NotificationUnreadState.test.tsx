import React from 'react'
import { Text } from 'react-native'
import { act, render, waitFor } from '@testing-library/react-native'

import { NotificationProvider, useNotification } from '../../../components/notifications/NotificationProvider'

const mockSubscribeToPushNotifications = jest.fn()
const mockCount = jest.fn()

jest.mock('../../../services/notificationService', () => ({
  notificationService: { count: (...args: unknown[]) => mockCount(...args) },
}))
jest.mock('../../../services/pushNotifications', () => ({
  subscribeToPushNotifications: (...args: unknown[]) => mockSubscribeToPushNotifications(...args),
}))
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }))
jest.mock('../../../theme/ThemeContext', () => ({
  ThemeContext: require('react').createContext({
    theme: {
      background: '#fff', card: '#fff', border: '#ddd', text: '#111', textSecondary: '#666',
      overlay: '#0008', successBackground: '#dff', successText: '#066', successBorder: '#0aa',
      errorBackground: '#fdd', errorText: '#a00', errorBorder: '#f00', warningBackground: '#ffd',
      warningText: '#660', warningBorder: '#aa0', infoBackground: '#def', infoText: '#06c',
      primary: '#06c', primaryDark: '#05a', errorAction: '#a00', errorOnAction: '#fff', onPrimary: '#fff',
    },
    darkMode: false,
  }),
}))

const count = mockCount

function Probe() {
  const { hasUnreadNotifications, unreadCount } = useNotification()
  return <Text testID="state">{`${unreadCount}:${hasUnreadNotifications}`}</Text>
}

const renderProvider = (isLoggedIn = true) => render(
  <NotificationProvider isLoggedIn={isLoggedIn}>
    <Probe />
  </NotificationProvider>,
)

beforeEach(() => {
  jest.clearAllMocks()
  count.mockResolvedValue(0)
  mockSubscribeToPushNotifications.mockReturnValue(jest.fn())
})

test('oculta el indicador sin notificaciones pendientes y lo muestra con una sin leer', async () => {
  count.mockResolvedValue(1)
  const view = renderProvider()

  await waitFor(() => expect(view.getByTestId('state').props.children).toBe('1:true'))
})

test('actualiza el indicador cuando llega una notificación nueva', async () => {
  count.mockResolvedValueOnce(0).mockResolvedValueOnce(2)
  const view = renderProvider()
  await waitFor(() => expect(view.getByTestId('state').props.children).toBe('0:false'))

  const onReceived = mockSubscribeToPushNotifications.mock.calls[0][0] as () => void
  await act(async () => { onReceived() })

  await waitFor(() => expect(view.getByTestId('state').props.children).toBe('2:true'))
})

test('conserva el último estado confirmado si falla la consulta y limpia al cerrar sesión', async () => {
  count.mockResolvedValueOnce(2).mockRejectedValueOnce(new Error('sin red'))
  const view = renderProvider()
  await waitFor(() => expect(view.getByTestId('state').props.children).toBe('2:true'))

  const onReceived = mockSubscribeToPushNotifications.mock.calls[0][0] as () => void
  await act(async () => { onReceived() })
  await waitFor(() => expect(count).toHaveBeenCalledTimes(2))
  expect(view.getByTestId('state').props.children).toBe('2:true')

  view.rerender(
    <NotificationProvider isLoggedIn={false}>
      <Probe />
    </NotificationProvider>,
  )
  await waitFor(() => expect(view.getByTestId('state').props.children).toBe('0:false'))
})
