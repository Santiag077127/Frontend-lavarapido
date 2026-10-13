/// <reference types="jest" />
import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'
import NotificationsScreen from './NotificationsScreen'
import { notificationService } from '../../../services/notificationService'

let mockLanguage = 'es'
const mockCopy: Record<string, string> = {
  'notifications.title': 'Notificaciones', 'notifications.unread': '{{count}} sin leer', 'notifications.all': 'Todas', 'notifications.only': 'No leídas', 'notifications.readAll': 'Marcar todas como leídas', 'notifications.loading': 'Cargando notificaciones', 'notifications.errorTitle': 'No pudimos cargar tus notificaciones', 'notifications.error': 'Comprueba tu conexión e inténtalo de nuevo.', 'notifications.retry': 'Reintentar', 'notifications.emptyTitle': 'Aún no tienes notificaciones', 'notifications.empty': 'Las novedades de tus reservas, servicios y pagos aparecerán aquí.', 'notifications.read': 'Marcar como leída', 'notifications.booking': 'Ver reserva', 'notifications.payment': 'Ver pago', 'notifications.assignments': 'Ver asignaciones', 'notifications.new': 'Nueva', 'notifications.categories.booking': 'Reserva', 'notifications.categories.payment': 'Pago', 'notifications.categories.status': 'Servicio', 'notifications.categories.system': 'Sistema', 'notifications.page': 'Página {{current}} de {{total}}',
}
const mockT = (key: string, values?: Record<string, string | number>) => {
  const translated = mockLanguage === 'en' && key === 'notifications.title' ? 'Notifications' : mockCopy[key] ?? key
  return Object.entries(values ?? {}).reduce((text, [name, value]) => text.replace(`{{${name}}}`, String(value)), translated)
}

jest.mock('@react-navigation/native', () => ({ useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]), useNavigation: () => ({ navigate: jest.fn(), getParent: () => ({ navigate: jest.fn() }) }) }))
jest.mock('@expo/vector-icons', () => ({ Ionicons: Object.assign((props: any) => require('react').createElement(require('react-native').Text, props), { glyphMap: {} }) }))
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: mockT, i18n: { resolvedLanguage: mockLanguage } }) }))
jest.mock('../../../theme/ThemeContext', () => ({ ThemeContext: require('react').createContext({ theme: { background: '#F7FBFF', card: '#FFFFFF', interactiveSurface: '#E6F1FF', infoBackground: '#E6F1FF', errorBackground: '#DC262612', text: '#0D1B3E', primary: '#1565C0', accentText: '#0E7490', success: '#16A34A', errorText: '#DC2626', textSecondary: '#4A5568', border: '#DDE4EF', onPrimary: '#FFFFFF', shadow: '#0D1B3E' } }) }))
jest.mock('../../../services/notificationService', () => ({ notificationService: { list: jest.fn(), count: jest.fn(), read: jest.fn(), readAll: jest.fn() } }))
jest.mock('../../reservations/services/reservationService', () => ({ reservationService: { getById: jest.fn() } }))

const list = notificationService.list as jest.Mock
const count = notificationService.count as jest.Mock
const emptyPage = { content: [], number: 0, totalPages: 0, totalElements: 0 }

beforeEach(() => { jest.clearAllMocks(); mockLanguage = 'es'; count.mockResolvedValue(0) })

test('muestra carga mientras espera la bandeja', async () => {
  list.mockReturnValue(new Promise(() => {}))
  const view = await render(<NotificationsScreen />)
  expect(view.getByLabelText('Cargando notificaciones')).toBeTruthy()
})

test('muestra error y permite reintentar', async () => {
  list.mockRejectedValueOnce(new Error('sin red')).mockResolvedValueOnce(emptyPage)
  const view = await render(<NotificationsScreen />)
  await waitFor(() => expect(view.getByText('No pudimos cargar tus notificaciones')).toBeTruthy())
  await act(async () => { fireEvent.press(view.getByText('Reintentar')) })
  await waitFor(() => expect(view.getByText('Aún no tienes notificaciones')).toBeTruthy())
  expect(list).toHaveBeenCalledTimes(2)
})

test('muestra estado vacío y contador de no leídas', async () => {
  list.mockResolvedValue(emptyPage); count.mockResolvedValue(2)
  const view = await render(<NotificationsScreen />)
  await waitFor(() => expect(view.getByText('Aún no tienes notificaciones')).toBeTruthy())
  expect(view.getByText('2 sin leer')).toBeTruthy()
})

test('adapta títulos y mensajes largos en una tarjeta y permite marcarla como leída', async () => {
  list.mockResolvedValue({ ...emptyPage, content: [{ id: 'long', tipo: 'booking', titulo: 'Una notificación con un título muy largo para comprobar la lectura completa en pantallas estrechas', mensaje: 'Un mensaje largo que debe conservarse dentro de la tarjeta sin recortes horizontales y con las acciones disponibles.', reservaId: null, pagoId: null, leidaAt: null, createdAt: '2026-01-10T12:30:00Z' }] })
  const view = await render(<NotificationsScreen />)
  await waitFor(() => expect(view.getByText(/título muy largo/)).toBeTruthy())
  expect(view.getByText(/sin recortes horizontales/)).toBeTruthy()
  expect(view.getByText('Nueva')).toBeTruthy()
  ;(notificationService.read as jest.Mock).mockResolvedValue({})
  await act(async () => { fireEvent.press(view.getByText('Marcar como leída')) })
  expect(notificationService.read).toHaveBeenCalledWith('long')
})

test('utiliza el idioma activo para los textos de interfaz', async () => {
  mockLanguage = 'en'; list.mockResolvedValue(emptyPage)
  const view = await render(<NotificationsScreen />)
  await waitFor(() => expect(view.getByText('Notifications')).toBeTruthy())
})
