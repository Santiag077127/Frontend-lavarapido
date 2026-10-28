import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';

import { ThemeContext } from '../../../theme/ThemeContext';
import BrandPickerModal from './BrandPickerModal';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@expo/vector-icons/Ionicons', () => () => null);

const lightTheme = {
  background: '#ffffff',
  border: '#dddddd',
  card: '#f5f5f5',
  onPrimary: '#ffffff',
  overlay: '#00000066',
  placeholder: '#777777',
  primary: '#0055aa',
  primarySoft: '#ddeeff',
  text: '#111111',
  textSecondary: '#555555',
};

test.each([
  ['light', lightTheme],
  ['dark', { ...lightTheme, background: '#101010', card: '#202020', text: '#f5f5f5' }],
])('renders the brand picker with %s theme colors and accessible selection', (_mode, theme) => {
  const view = render(
    <ThemeContext.Provider value={{ theme } as any}>
      <BrandPickerModal
        visible
        brands={[{ idMarca: 'brand-1', nombre: 'Toyota', estado: true }]}
        selectedBrandId="brand-1"
        query=""
        onQueryChange={jest.fn()}
        onSelect={jest.fn()}
        onClose={jest.fn()}
      />
    </ThemeContext.Provider>,
  );

  expect(StyleSheet.flatten(view.getByText('vehicles.form.selectBrand').props.style).color).toBe(theme.text);
  expect(view.getByRole('radio', { name: 'Toyota' }).props.accessibilityState.selected).toBe(true);
});
