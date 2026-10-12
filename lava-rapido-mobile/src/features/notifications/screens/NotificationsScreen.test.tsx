/// <reference types="jest" />
import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import NotificationsScreen from './NotificationsScreen';
import { notificationService } from '../../../services/notificationService';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]),
  useNavigation: () => ({ navigate: jest.fn(), getParent: () => ({ navigate: jest.fn() }) }),
}));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ i18n: { resolvedLanguage: 'es' } }) }));
jest.mock('../../../theme/ThemeContext', () => ({
  ThemeContext: require('react').createContext({ theme: {
    background: '#fff', text: '#000', primary: '#00f', border: '#ccc', textSecondary: '#555',
  } }),
}));
jest.mock('../../../services/notificationService', () => ({
  notificationService: { list: jest.fn(), count: jest.fn(), read: jest.fn(), readAll: jest.fn() },
}));
jest.mock('../../reservations/services/reservationService', () => ({
  reservationService: { getById: jest.fn() },
}));

const list = notificationService.list as jest.Mock;
const count = notificationService.count as jest.Mock;
const emptyPage = { content: [], number: 0, totalPages: 0, totalElements: 0 };

beforeEach(() => {
  jest.clearAllMocks();
  count.mockResolvedValue(0);
});

test('muestra carga mientras espera la bandeja', async () => {
  list.mockReturnValue(new Promise(() => {}));
  const view = await render(<NotificationsScreen />);
  expect(view.getByLabelText('Cargando notificaciones')).toBeTruthy();
});

test('muestra error y permite reintentar', async () => {
  list.mockRejectedValueOnce(new Error('sin red')).mockResolvedValueOnce(emptyPage);
  const view = await render(<NotificationsScreen />);
  await waitFor(() => expect(view.getByText('No se pudieron cargar las notificaciones.')).toBeTruthy());
  await act(async () => { fireEvent.press(view.getByText('Reintentar')); });
  await waitFor(() => expect(view.getByText('Aún no hay notificaciones.')).toBeTruthy());
  expect(list).toHaveBeenCalledTimes(2);
});

test('muestra estado vacío y contador de no leídas', async () => {
  list.mockResolvedValue(emptyPage);
  count.mockResolvedValue(2);
  const view = await render(<NotificationsScreen />);
  await waitFor(() => expect(view.getByText('Aún no hay notificaciones.')).toBeTruthy());
  expect(view.getByText('2 sin leer')).toBeTruthy();
});
