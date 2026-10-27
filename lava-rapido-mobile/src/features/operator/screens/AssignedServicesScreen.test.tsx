import React from 'react';
import { Alert, RefreshControl } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { ThemeContext } from '../../../theme/ThemeContext';
import { lightTheme } from '../../../theme/themeTokens';
import { assignmentService, type Assignment } from '../../../services/assignmentService';
import AssignedServicesScreen from './AssignedServicesScreen';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'es-CO' } }),
}));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]),
}));
jest.mock('@expo/vector-icons', () => ({
  Ionicons: (props: any) => require('react').createElement(require('react-native').Text, props),
}));
jest.mock('../../../services/assignmentService', () => ({
  assignmentService: { getMine: jest.fn(), updateStatus: jest.fn() },
}));
jest.mock('../../../services/api', () => ({
  classifyApiError: jest.fn(() => 'server_unavailable'),
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

function renderScreen() {
  return render(
    <ThemeContext.Provider value={{ theme: lightTheme }}>
      <AssignedServicesScreen />
    </ThemeContext.Provider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  (assignmentService.getMine as jest.Mock).mockResolvedValue({ data: [assignment] });
  (assignmentService.updateStatus as jest.Mock).mockResolvedValue({
    data: { ...assignment, estado: 'en_proceso' },
  });
});

test('shows loading until the initial assignment request finishes', async () => {
  let resolveLoad: (result: unknown) => void = () => {};
  (assignmentService.getMine as jest.Mock).mockReturnValueOnce(
    new Promise(resolve => { resolveLoad = resolve; }),
  );
  const view = renderScreen();
  expect(view.getByText('operator.loading')).toBeTruthy();
  await act(async () => resolveLoad({ data: [assignment] }));
  expect(view.getByText('Lavado exterior')).toBeTruthy();
  expect(assignmentService.getMine).toHaveBeenCalledTimes(1);
});

test('loads assignments once and renders service, client, vehicle and current status', async () => {
  const view = renderScreen();
  await waitFor(() => expect(view.getByText('Lavado exterior')).toBeTruthy(), { timeout: 10000 });

  expect(assignmentService.getMine).toHaveBeenCalledTimes(1);
  expect(view.getByText('Ana Cliente')).toBeTruthy();
  expect(view.getByText('ABC123')).toBeTruthy();
  expect(view.getByText('operator.status.assigned')).toBeTruthy();
  expect(view.getByRole('button', { name: 'operator.actions.start' })).toBeTruthy();
});

test('shows the empty state after an empty response', async () => {
  (assignmentService.getMine as jest.Mock).mockResolvedValueOnce({ data: [] });
  const view = renderScreen();
  await waitFor(() => expect(view.getByText('operator.empty.title')).toBeTruthy());
  expect(view.getByText('operator.empty.description')).toBeTruthy();
});

test('filters assigned, in-progress, and completed services using assignment states', async () => {
  (assignmentService.getMine as jest.Mock).mockResolvedValueOnce({ data: [
    assignment,
    { ...assignment, idAsignacion: 'assignment-2', idReserva: 'reservation-2', estado: 'en_proceso' },
    { ...assignment, idAsignacion: 'assignment-3', idReserva: 'reservation-3', estado: 'completada' },
    { ...assignment, idAsignacion: 'assignment-4', idReserva: 'reservation-4', estado: 'cancelada' },
  ] });
  const view = renderScreen();
  await waitFor(() => expect(view.getAllByText('Lavado exterior')).toHaveLength(4));

  fireEvent.press(view.getByRole('button', { name: 'operator.filters.assigned' }));
  expect(view.getAllByText('Lavado exterior')).toHaveLength(1);
  expect(view.getByRole('button', { name: 'operator.actions.start' })).toBeTruthy();

  fireEvent.press(view.getByRole('button', { name: 'operator.filters.inProgress' }));
  expect(view.getAllByText('Lavado exterior')).toHaveLength(1);
  expect(view.getByRole('button', { name: 'operator.actions.finish' })).toBeTruthy();

  fireEvent.press(view.getByRole('button', { name: 'operator.filters.completed' }));
  expect(view.getAllByText('Lavado exterior')).toHaveLength(1);
  expect(view.queryByRole('button', { name: 'operator.actions.finish' })).toBeNull();
});

test('shows a clear empty state for a selected filter without results', async () => {
  const view = renderScreen();
  await waitFor(() => expect(view.getByText('Lavado exterior')).toBeTruthy());
  fireEvent.press(view.getByRole('button', { name: 'operator.filters.completed' }));
  expect(view.getByText('operator.filters.empty')).toBeTruthy();
  expect(view.getByText('operator.filters.emptyDescription')).toBeTruthy();
});

test('shows a load error and retries the same request', async () => {
  (assignmentService.getMine as jest.Mock).mockRejectedValueOnce(new Error('offline'));
  const view = renderScreen();
  await waitFor(() => expect(view.getByText('operator.errors.loadTitle')).toBeTruthy());
  fireEvent.press(view.getByRole('button', { name: 'common.retry' }));
  await waitFor(() => expect(view.getByText('Lavado exterior')).toBeTruthy());
  expect(assignmentService.getMine).toHaveBeenCalledTimes(2);
});

test('refreshes the list on demand', async () => {
  const view = renderScreen();
  await waitFor(() => expect(view.getByText('Lavado exterior')).toBeTruthy());
  act(() => view.UNSAFE_getByType(RefreshControl).props.onRefresh());
  await waitFor(() => expect(assignmentService.getMine).toHaveBeenCalledTimes(2));
});

test('starts an assignment with one status request and shows the returned state', async () => {
  const view = renderScreen();
  await waitFor(() => expect(view.getByText('Lavado exterior')).toBeTruthy());
  fireEvent.press(view.getByRole('button', { name: 'operator.actions.start' }));
  await waitFor(() => expect(view.getByText('operator.status.inProgress')).toBeTruthy());
  expect(assignmentService.updateStatus).toHaveBeenCalledTimes(1);
  expect(assignmentService.updateStatus).toHaveBeenCalledWith('assignment-1', 'en_proceso');
  expect(view.getByRole('button', { name: 'operator.actions.finish' })).toBeTruthy();
});

test('keeps the current state and reports an HTTP update failure', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  (assignmentService.updateStatus as jest.Mock).mockRejectedValueOnce({ response: { status: 409 } });
  const view = renderScreen();
  await waitFor(() => expect(view.getByText('Lavado exterior')).toBeTruthy());
  fireEvent.press(view.getByRole('button', { name: 'operator.actions.start' }));
  await waitFor(() => expect(alert).toHaveBeenCalledWith(
    'operator.errors.updateTitle', 'operator.errors.updateMessage',
  ));
  expect(view.getByText('operator.status.assigned')).toBeTruthy();
  expect(view.queryByText('operator.status.inProgress')).toBeNull();
  alert.mockRestore();
});

test('prevents concurrent status requests', async () => {
  let resolveUpdate: (result: unknown) => void = () => {};
  (assignmentService.updateStatus as jest.Mock).mockReturnValueOnce(
    new Promise(resolve => { resolveUpdate = resolve; }),
  );
  (assignmentService.getMine as jest.Mock).mockResolvedValueOnce({
    data: [assignment, { ...assignment, idAsignacion: 'assignment-2', nombreServicio: 'Lavado interior' }],
  });
  const view = renderScreen();
  await waitFor(() => expect(view.getByText('Lavado interior')).toBeTruthy());
  fireEvent.press(view.getAllByRole('button', { name: 'operator.actions.start' })[0]);
  fireEvent.press(view.getAllByRole('button', { name: /operator\.actions\.start/ })[0]);
  expect(assignmentService.updateStatus).toHaveBeenCalledTimes(1);
  await act(async () => resolveUpdate({ data: { ...assignment, estado: 'en_proceso' } }));
});
