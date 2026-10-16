import React from 'react'
import { render } from '@testing-library/react-native'

import NotificationTabIcon from '../../../components/notifications/NotificationTabIcon'

let mockHasUnreadNotifications = false

jest.mock('../../../components/notifications/NotificationProvider', () => ({
  useNotification: () => ({ hasUnreadNotifications: mockHasUnreadNotifications }),
}))
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }))
jest.mock('../../../theme/ThemeContext', () => ({
  ThemeContext: require('react').createContext({ theme: { card: '#fff' } }),
}))

beforeEach(() => { mockHasUnreadNotifications = false })

test('oculta el punto naranja cuando no hay notificaciones pendientes', () => {
  const view = render(<NotificationTabIcon color="#111" size={24} />)

  expect(view.queryByTestId('notification-unread-dot')).toBeNull()
})

test('muestra un punto naranja independiente del tema cuando hay pendientes', () => {
  mockHasUnreadNotifications = true
  const view = render(<NotificationTabIcon color="#fff" size={24} />)

  expect(view.getByTestId('notification-unread-dot').props.style).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ backgroundColor: '#F97316' }),
    ]),
  )
})
