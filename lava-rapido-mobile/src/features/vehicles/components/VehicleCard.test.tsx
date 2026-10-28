import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import VehicleCard from './VehicleCard';
import type { Vehicle } from '../../../services/vehicleService';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);

const vehicle: Vehicle = {
  idVehiculo: 'vehicle-1',
  userId: 'user-1',
  nombreUsuario: 'User',
  emailUsuario: 'user@example.test',
  idMarca: 'brand-1',
  nombreMarca: 'Toyota',
  marcaAprobada: true,
  placa: 'ABC123',
  color: 'Negro',
  tipoVehiculo: 'CARRO',
  estado: true,
  createdAt: '2026-01-01T00:00:00Z',
};

const theme = {
  card: '#fff', border: '#ddd', primarySoft: '#eef', primary: '#06c', text: '#111',
  textSecondary: '#666', successBackground: '#efe', errorBackground: '#fee',
  successBorder: '#8c8', errorBorder: '#f88', successText: '#080', errorText: '#c00',
  background: '#fafafa', onPrimary: '#fff', infoBorder: '#99f',
};
const translate = (key: string) => key;

test('renders vehicle details and active-state actions accessibly', () => {
  const onEdit = jest.fn();
  const onChangeStatus = jest.fn();
  const view = render(<VehicleCard vehicle={vehicle} theme={theme} translate={translate} onEdit={onEdit} onChangeStatus={onChangeStatus} />);

  expect(view.getByText('Toyota')).toBeTruthy();
  expect(view.getByText('ABC123')).toBeTruthy();
  expect(view.getByText('vehicles.status.active')).toBeTruthy();
  expect(view.getByText('Negro')).toBeTruthy();
  fireEvent.press(view.getByRole('button', { name: 'accessibility.editVehicle: ABC123' }));
  fireEvent.press(view.getByRole('button', { name: 'Eliminar: ABC123' }));
  expect(onEdit).toHaveBeenCalledWith(vehicle);
  expect(onChangeStatus).toHaveBeenCalledWith(vehicle);
});

test('renders inactive state and activation action using the supplied theme', () => {
  const inactiveVehicle = { ...vehicle, estado: false };
  const darkTheme = { ...theme, card: '#151515', text: '#fafafa' };
  const view = render(<VehicleCard vehicle={inactiveVehicle} theme={darkTheme} translate={translate} onEdit={jest.fn()} onChangeStatus={jest.fn()} />);

  expect(view.getByText('vehicles.status.inactive')).toBeTruthy();
  expect(view.getByRole('button', { name: 'vehicles.status.activate: ABC123' })).toBeTruthy();
  expect(view.getByText('Toyota').props.style).toEqual(expect.arrayContaining([expect.objectContaining({ color: '#fafafa' })]));
});
