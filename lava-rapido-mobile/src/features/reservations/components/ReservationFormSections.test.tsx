import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'

import { darkTheme, lightTheme } from '../../../theme/themeTokens'
import SelectedServiceCard from './SelectedServiceCard'
import VehicleSelectionCard from './VehicleSelectionCard'
import ReservationDateCard from './ReservationDateCard'
import ReservationTimeCard from './ReservationTimeCard'
import ReservationSummaryCard from './ReservationSummaryCard'
import type { ReservationColors } from './reservationFormTypes'
import type { Vehicle } from '../../vehicles/types/vehicle.types'

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }))
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))
jest.mock('@react-native-community/datetimepicker', () => {
  const ReactModule = require('react')
  const { Pressable, Text } = require('react-native')
  return {
    __esModule: true,
    default: ({ mode, onChange }: { mode: string; onChange: (event: unknown, date: Date) => void }) =>
      ReactModule.createElement(Pressable, {
        accessibilityRole: 'button', accessibilityLabel: `choose-${mode}`,
        onPress: () => onChange({}, new Date(2026, 10, 12, 10, 30)),
      }, ReactModule.createElement(Text, null, `choose-${mode}`)),
  }
})

const colors = (theme: typeof lightTheme): ReservationColors => ({
  background: theme.background,
  card: theme.card,
  text: theme.text,
  secondaryText: theme.textSecondary,
  border: theme.border,
  primary: theme.primary,
  onPrimary: theme.onPrimary,
  inputBackground: theme.inputBackground,
  danger: theme.errorText,
  success: theme.success,
})
const vehicle = {
  idVehiculo: 'vehicle-1', estado: true, nombreMarca: 'Marca', placa: 'ABC123', tipoVehiculo: 'CARRO',
} as Vehicle
const onRetry = jest.fn()
const onAddVehicle = jest.fn()
const onSelectVehicle = jest.fn()
const onOpenDatePicker = jest.fn()
const onDateChange = jest.fn()
const onOpenTimePicker = jest.fn()
const onTimeChange = jest.fn()

beforeEach(() => jest.clearAllMocks())

test('renders the selected service and duration using the active theme', () => {
  const view = render(
    <SelectedServiceCard serviceName="Lavado" serviceDescription="Exterior" formattedPrice="$25.000" serviceDuration={60} colors={colors(lightTheme)} theme={lightTheme} />,
  )
  expect(view.getByText('Lavado')).toBeTruthy()
  expect(view.getByText('Exterior')).toBeTruthy()
  expect(view.getByText('$25.000')).toBeTruthy()
  expect(view.getByText('60 mobile.home.minutes')).toBeTruthy()

  view.rerender(
    <SelectedServiceCard serviceName="Lavado" serviceDescription="" formattedPrice="$25.000" serviceDuration={0} colors={colors(darkTheme)} theme={darkTheme} />,
  )
  expect(view.queryByText('Exterior')).toBeNull()
  expect(view.getByText('mobile.reservation.notAvailable')).toBeTruthy()
  expect(StyleSheet.flatten(view.getByText('Lavado').props.style).color).toBe(darkTheme.primary)
})

test('shows selected vehicles and delegates selection without fetching data', () => {
  const view = render(
    <VehicleSelectionCard activeVehicles={[vehicle]} selectedVehicleId="vehicle-1" vehicleLoadError={null} loadingVehicles={false} onRetry={onRetry} onAddVehicle={onAddVehicle} onSelectVehicle={onSelectVehicle} colors={colors(lightTheme)} theme={lightTheme} />,
  )
  const card = view.getByRole('radio', { name: 'Marca ABC123' })
  expect(card.props.accessibilityState.selected).toBe(true)
  fireEvent.press(card)
  expect(onSelectVehicle).toHaveBeenCalledWith('vehicle-1')
  expect(onRetry).not.toHaveBeenCalled()
})

test('keeps empty and retryable vehicle states separate', () => {
  const props = { activeVehicles: [] as Vehicle[], selectedVehicleId: '', vehicleLoadError: null, loadingVehicles: false, onRetry, onAddVehicle, onSelectVehicle, colors: colors(lightTheme), theme: lightTheme }
  const view = render(<VehicleSelectionCard {...props} />)
  expect(view.getByText('mobile.reservation.noVehicles')).toBeTruthy()
  fireEvent.press(view.getByText('mobile.reservation.registerVehicle'))
  expect(onAddVehicle).toHaveBeenCalledTimes(1)

  view.rerender(<VehicleSelectionCard {...props} vehicleLoadError="network" />)
  expect(view.getByRole('alert').props.children).toBe('apiErrors.network')
  fireEvent.press(view.getByRole('button', { name: 'common.retry' }))
  expect(onRetry).toHaveBeenCalledTimes(1)
  expect(onAddVehicle).toHaveBeenCalledTimes(1)
})

test('preserves date and time picker callbacks and schedule hint', () => {
  const date = new Date(2026, 10, 10, 8, 0)
  const dateView = render(
    <ReservationDateCard selectedDate={date} showDatePicker={false} onOpenDatePicker={onOpenDatePicker} onDateChange={onDateChange} colors={colors(lightTheme)} />,
  )
  fireEvent.press(dateView.getByRole('button', { name: /^mobile\.reservation\.reservationDate/ }))
  expect(onOpenDatePicker).toHaveBeenCalledTimes(1)
  dateView.rerender(<ReservationDateCard selectedDate={date} showDatePicker onOpenDatePicker={onOpenDatePicker} onDateChange={onDateChange} colors={colors(lightTheme)} />)
  fireEvent.press(dateView.getByRole('button', { name: 'choose-date' }))
  expect(onDateChange).toHaveBeenCalledWith({}, expect.any(Date))

  const timeView = render(
    <ReservationTimeCard selectedTime={date} showTimePicker onOpenTimePicker={onOpenTimePicker} onTimeChange={onTimeChange} minHour={8} maxHour={18} colors={colors(darkTheme)} />,
  )
  fireEvent.press(timeView.getByRole('button', { name: /^mobile\.reservation\.reservationTime/ }))
  fireEvent.press(timeView.getByRole('button', { name: 'choose-time' }))
  expect(onOpenTimePicker).toHaveBeenCalledTimes(1)
  expect(onTimeChange).toHaveBeenCalledWith({}, expect.any(Date))
  expect(timeView.getByText('mobile.reservation.schedule')).toBeTruthy()
})

test('renders the unchanged reservation summary values', () => {
  const onOpenTerms = jest.fn()
  const view = render(
    <ReservationSummaryCard serviceName="Lavado" selectedDateText="2026-11-10" selectedTimeText="08:00:00" formattedPrice="$25.000" colors={colors(lightTheme)} onOpenTerms={onOpenTerms} />,
  )
  expect(view.getByText('Lavado')).toBeTruthy()
  expect(view.getByText('2026-11-10')).toBeTruthy()
  expect(view.getByText('08:00:00')).toBeTruthy()
  expect(view.getByText('$25.000')).toBeTruthy()
  expect(view.getByText('mobile.reservation.cancellationPolicySummary')).toBeTruthy()
  fireEvent.press(view.getByRole('link', { name: 'mobile.reservation.readCancellationPolicy' }))
  expect(onOpenTerms).toHaveBeenCalledTimes(1)
})
