import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { darkTheme, lightTheme } from '../../../theme/themeTokens';
import type { VehicleTypeOption } from './VehicleForm';
import VehicleForm from './VehicleForm';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);

const vehicleTypes: VehicleTypeOption[] = [
  { value: 'CARRO', labelKey: 'vehicles.types.car', icon: 'car-sport-outline' },
  { value: 'MOTO', labelKey: 'vehicles.types.motorcycle', icon: 'bicycle-outline' },
];
const translate = (key: string) => key;

const createProps = () => ({
  theme: lightTheme,
  translate,
  vehicleTypes,
  isEditing: false,
  plate: '',
  onPlateChange: jest.fn(),
  plateFormatMessage: 'Formato de placa',
  invalidPlate: false,
  color: '',
  onColorChange: jest.fn(),
  selectedBrandName: undefined,
  loadingBrands: false,
  brandsLoadError: false,
  onOpenBrandPicker: jest.fn(),
  onRetryBrandLoad: jest.fn(),
  saving: false,
  selectedVehicleType: 'CARRO' as const,
  onVehicleTypeChange: jest.fn(),
  onSave: jest.fn(),
  onCancel: jest.fn(),
});

test('renders vehicle fields and delegates field, brand, type, and action interactions', () => {
  const props = createProps();
  const view = render(<VehicleForm {...props} />);

  expect(view.getByLabelText('vehicles.fields.plate')).toBeTruthy();
  expect(view.getByLabelText('vehicles.fields.color')).toBeTruthy();
  expect(view.getByRole('radio', { name: 'vehicles.types.car' })).toBeTruthy();
  fireEvent.changeText(view.getByLabelText('vehicles.fields.plate'), 'ABC123');
  fireEvent.changeText(view.getByLabelText('vehicles.fields.color'), 'Negro');
  fireEvent.press(view.getByRole('button', { name: 'vehicles.fields.brand: vehicles.form.selectBrand' }));
  fireEvent.press(view.getByRole('radio', { name: 'vehicles.types.motorcycle' }));
  fireEvent.press(view.getByRole('button', { name: 'vehicles.actions.add' }));
  fireEvent.press(view.getByRole('button', { name: 'common.cancel' }));

  expect(props.onPlateChange).toHaveBeenCalledWith('ABC123');
  expect(props.onColorChange).toHaveBeenCalledWith('Negro');
  expect(props.onOpenBrandPicker).toHaveBeenCalledTimes(1);
  expect(props.onVehicleTypeChange).toHaveBeenCalledWith('MOTO');
  expect(props.onSave).toHaveBeenCalledTimes(1);
  expect(props.onCancel).toHaveBeenCalledTimes(1);
});

test('shows editing values, brand loading errors, and theme colors accessibly', () => {
  const props = {
    ...createProps(),
    theme: darkTheme,
    isEditing: true,
    plate: 'ABC123',
    color: 'Negro',
    selectedBrandName: 'Toyota',
    brandsLoadError: true,
  };
  const view = render(<VehicleForm {...props} />);

  expect(view.getByLabelText('vehicles.fields.plate').props.value).toBe('ABC123');
  expect(view.getByLabelText('vehicles.fields.color').props.value).toBe('Negro');
  expect(view.getByRole('button', { name: 'vehicles.fields.brand: Toyota' })).toBeTruthy();
  expect(view.getByText('vehicles.errors.brands')).toBeTruthy();
  expect(view.getByRole('button', { name: 'vehicles.form.saveChanges' })).toBeTruthy();
  expect(view.getByText('vehicles.fields.plate').props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ color: darkTheme.text })]),
  );
  fireEvent.press(view.getByRole('button', { name: 'common.retry' }));
  expect(props.onRetryBrandLoad).toHaveBeenCalledTimes(1);
});
