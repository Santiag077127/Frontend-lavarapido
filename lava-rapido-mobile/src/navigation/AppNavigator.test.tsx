import React from 'react';
import { Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

jest.mock('@react-navigation/native-stack', () => {
  const ReactRuntime = require('react');
  const { Text: NativeText } = require('react-native');
  return {
    createNativeStackNavigator: () => ({
      Navigator: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => {
        (globalThis as { navigatorProps?: Record<string, unknown> }).navigatorProps = props;
        return ReactRuntime.createElement(ReactRuntime.Fragment, null, children);
      },
      Screen: ({ name }: { name: string }) =>
        ReactRuntime.createElement(NativeText, null, name),
    }),
  };
});

jest.mock('../features/services/screens/ServiceDetailScreen', () => () => null);
jest.mock('../features/reservations/screens/ReservationScreen', () => () => null);
jest.mock('../features/reservations/screens/ReservationPaymentScreen', () => () => null);
jest.mock('../features/auth/screens/LoginScreen', () => () => null);
jest.mock('../features/auth/screens/RegisterScreen', () => () => null);
jest.mock('../features/auth/screens/ForgotPasswordScreen', () => () => null);
jest.mock('../features/auth/screens/ResetPasswordScreen', () => () => null);
jest.mock('../features/auth/screens/EditProfileScreen', () => () => null);
jest.mock('../features/auth/screens/ChangePasswordScreen', () => () => null);
jest.mock('../features/profile/screens/ServiceDetailsScreen', () => () => null);
jest.mock('../features/map/screens/MapScreen', () => () => null);
jest.mock('../features/vehicles/screens/MyVehiclesScreen', () => () => null);
jest.mock('../features/vehicles/screens/AddVehicleScreen', () => () => null);
jest.mock('./TabNavigator', () => () => null);
jest.mock('./OperatorNavigator', () => () => null);

jest.mock('../theme/ThemeContext', () => ({
  ThemeContext: require('react').createContext({
    theme: { background: '#040833' },
  }),
}));

const AppNavigator = require('./AppNavigator').default as typeof import('./AppNavigator').default;

test('usuarios sin sesión comienzan directamente en Login y no tienen ruta Landing', async () => {
  let renderer: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(
      <AppNavigator
        isLoggedIn={false}
        setIsLoggedIn={jest.fn()}
        role={null}
        setRole={jest.fn()}
      />,
    );
  });

  const routes = renderer!.root.findAllByType(Text).map((node) => node.props.children);
  expect(routes[0]).toBe('Login');
  expect(routes).not.toContain('Landing');
  expect((globalThis as { navigatorProps?: { screenOptions?: { contentStyle?: { backgroundColor?: string } } } }).navigatorProps?.screenOptions?.contentStyle?.backgroundColor).toBe('#040833');
});
