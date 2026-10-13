/// <reference types="jest" />
import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import ReservationPaymentScreen from './ReservationPaymentScreen'
import { paymentService } from '../../../services/paymentService'

const mockNavigate = jest.fn()
const mockCopy: Record<string, string> = { 'mobile.paymentFlow.approvedTitle': 'Pago aprobado', 'mobile.paymentFlow.approvedMessage': 'Tu pago fue confirmado.', 'mobile.paymentFlow.myServices': 'Ver mis servicios', 'mobile.paymentFlow.goHome': 'Volver al inicio', 'mobile.paymentFlow.pending': 'Pendiente de confirmación', 'mobile.paymentFlow.declined': 'Pago rechazado', 'mobile.paymentFlow.retryPayment': 'Reintentar pago', 'mobile.paymentFlow.error': 'Error de pago', 'mobile.paymentFlow.startError': 'Error al iniciar el pago', 'mobile.paymentFlow.duplicateHint': 'Requiere revisión', 'mobile.paymentFlow.duplicateApproval': 'Posible cobro duplicado' }

jest.mock('@react-navigation/native', () => ({ useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]) }))
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => mockCopy[key] ?? key }) }))
jest.mock('@expo/vector-icons', () => ({ Ionicons: (props: any) => require('react').createElement(require('react-native').Text, props) }))
jest.mock('react-native-webview', () => ({ WebView: (props: any) => require('react').createElement(require('react-native').View, props) }))
jest.mock('../../../components/common/BackButton', () => ({ __esModule: true, default: () => null }))
jest.mock('../../../theme/ThemeContext', () => ({ ThemeContext: require('react').createContext({ theme: { background: '#F7FBFF', card: '#FFFFFF', border: '#DDE4EF', text: '#0D1B3E', textSecondary: '#4A5568', primary: '#1565C0', primarySoft: '#E6F1FF', onPrimary: '#FFFFFF', success: '#16A34A', successBackground: '#16A34A12', errorText: '#DC2626' } }) }))
jest.mock('../../../services/paymentService', () => ({ paymentService: { getByReservation: jest.fn(), start: jest.fn(), verify: jest.fn() } }))

const reservation = { idReserva: 'res-1' }
const payment = (estado: 'aprobado' | 'rechazado' | 'pendiente', intentoEstado: string = estado) => ({ idPago: 'pay-1', idReserva: 'res-1', estado, intentoActual: { estado: intentoEstado }, intentos: [] })
const renderPayment = () => render(<ReservationPaymentScreen route={{ params: { reservation } } as any} navigation={{ navigate: mockNavigate, goBack: jest.fn() } as any} />)

beforeEach(() => { jest.clearAllMocks(); (paymentService.start as jest.Mock).mockResolvedValue({ referencia: 'ref-1' }) })

test('pago aprobado confirma y abre la pantalla real de Mis servicios', async () => {
  (paymentService.getByReservation as jest.Mock).mockResolvedValue(payment('aprobado'))
  const view = renderPayment()
  await waitFor(() => expect(view.getByText('Ver mis servicios')).toBeTruthy())
  expect(view.getByText('Pago aprobado')).toBeTruthy()
  fireEvent.press(view.getByText('Ver mis servicios'))
  expect(mockNavigate).toHaveBeenCalledWith('MainTabs', { screen: 'Mis servicios', params: { initialStatus: 'PENDIENTE' } })
  expect(paymentService.start).not.toHaveBeenCalled()
  expect(paymentService.verify).not.toHaveBeenCalled()
  expect(view.queryByText('Ir a mis reservas')).toBeNull()
})

test.each(['pendiente', 'rechazado'] as const)('pago %s no muestra confirmación exitosa', async (estado) => {
  (paymentService.getByReservation as jest.Mock).mockResolvedValue(payment(estado))
  const view = renderPayment()
  await waitFor(() => expect(paymentService.getByReservation).toHaveBeenCalled())
  await waitFor(() => expect(view.queryByText('mobile.paymentFlow.processing')).toBeNull())
  expect(view.queryByText('Ver mis servicios')).toBeNull()
  expect(mockNavigate).not.toHaveBeenCalled()
})

test('fallo de consulta no muestra pago aprobado', async () => {
  (paymentService.getByReservation as jest.Mock).mockRejectedValue({ response: { status: 500 } })
  const view = renderPayment()
  await waitFor(() => expect(view.getByText('Error al iniciar el pago')).toBeTruthy())
  expect(view.queryByText('Ver mis servicios')).toBeNull()
  expect(paymentService.start).not.toHaveBeenCalled()
})

test('aprobación duplicada conserva el aviso y no presenta éxito', async () => {
  (paymentService.getByReservation as jest.Mock).mockResolvedValue(payment('aprobado', 'aprobado_duplicado'))
  const view = renderPayment()
  await waitFor(() => expect(view.getByText('Requiere revisión')).toBeTruthy())
  expect(view.queryByText('Ver mis servicios')).toBeNull()
})
