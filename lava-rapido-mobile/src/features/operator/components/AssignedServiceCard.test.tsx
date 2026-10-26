import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { ThemeContext } from '../../../theme/ThemeContext';
import { darkTheme, lightTheme } from '../../../theme/themeTokens';
import type { Assignment } from '../../../services/assignmentService';
import AssignedServiceCard from './AssignedServiceCard';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'es-CO' } }),
}));

const assignment: Assignment = {
  idAsignacion: 'assignment-1',
  idReserva: 'reservation-12345678',
  idOperador: 'operator-1',
  nombreOperador: 'Operator',
  estado: 'asignada',
  fechaAsignacion: '2026-01-01T10:00:00',
  nombreCliente: 'Ana Cliente',
  placa: 'ABC123',
  color: 'Azul',
  tipoVehiculo: 'CARRO',
  idServicio: 'service-1',
  nombreServicio: 'Lavado exterior',
  descripcionServicio: 'Limpieza completa',
  precioServicio: 25000,
  duracionMinutos: 60,
  fechaReserva: '2026-11-01',
  horaReserva: '10:30:00',
  createdAt: '2026-01-01T10:00:00',
  updatedAt: '2026-01-01T10:00:00',
};

function renderCard(item: Assignment, isUpdating = false, dark = false, onChangeStatus = jest.fn()) {
  const action = item.estado === 'asignada'
    ? { label: 'operator.actions.start', status: 'en_proceso' as const }
    : null;
  return render(
    <ThemeContext.Provider value={{ theme: dark ? darkTheme : lightTheme }}>
      <AssignedServiceCard item={item} action={action} isUpdating={isUpdating} onChangeStatus={onChangeStatus} />
    </ThemeContext.Provider>,
  );
}

test('renders assignment data and sends the allowed action through its callback', () => {
  const onChangeStatus = jest.fn();
  const view = renderCard(assignment, false, false, onChangeStatus);
  expect(view.getByText('Lavado exterior')).toBeTruthy();
  expect(view.getByText('Ana Cliente')).toBeTruthy();
  expect(view.getByText('ABC123')).toBeTruthy();
  expect(view.getByText('operator.status.assigned')).toBeTruthy();
  const action = view.getByRole('button', { name: 'operator.actions.start' });
  expect(action.props.accessibilityState).toEqual({ disabled: false, busy: false });
  fireEvent.press(action);
  expect(onChangeStatus).toHaveBeenCalledWith(assignment, 'en_proceso');
});

test('announces a pending update and hides terminal actions', () => {
  const view = renderCard(assignment, true);
  const action = view.getByRole('button', { name: 'operator.actions.start, accessibility.inProgress' });
  expect(action.props.accessibilityState).toEqual({ disabled: true, busy: true });
  expect(renderCard({ ...assignment, estado: 'completada' }).queryAllByRole('button')).toHaveLength(0);
  expect(renderCard({ ...assignment, estado: 'cancelada' }).queryAllByRole('button')).toHaveLength(0);
});

test('uses the light and dark status colors', () => {
  const light = renderCard(assignment);
  const dark = renderCard(assignment, false, true);
  expect(StyleSheet.flatten(light.getByText('operator.status.assigned').props.style).color).toBe(lightTheme.infoText);
  expect(StyleSheet.flatten(dark.getByText('operator.status.assigned').props.style).color).toBe(darkTheme.infoText);
});
