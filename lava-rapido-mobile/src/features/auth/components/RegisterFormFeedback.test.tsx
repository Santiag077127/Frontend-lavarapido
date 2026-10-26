import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { RegisterFormActions, RegisterFormMessage } from './RegisterFormFeedback';

jest.mock('@expo/vector-icons', () => ({ Feather: () => null, Ionicons: () => null, MaterialIcons: () => null }));

const theme = {
  errorBackground: '#fee', errorBorder: '#f88', errorText: '#c00', successBackground: '#efe', successBorder: '#8c8',
  successText: '#080', primaryDark: '#06c', onPrimary: '#fff', text: '#111', primary: '#06c',
};
const translate = (key: string) => key;

test.each(['error', 'success'] as const)('renders %s feedback with an alert role', (variant) => {
  const view = render(<RegisterFormMessage message="Formulario enviado" variant={variant} theme={theme} />);
  expect(view.getByRole('alert')).toHaveTextContent(/Formulario enviado/);
});

test('exposes loading state and routes submit and login actions', () => {
  const onSubmit = jest.fn();
  const onLogin = jest.fn();
  const view = render(<RegisterFormActions loading theme={theme} translate={translate} onSubmit={onSubmit} onLogin={onLogin} />);
  const submit = view.getByRole('button', { name: /register.button/ });
  expect(submit.props.accessibilityState).toMatchObject({ disabled: true, busy: true });
  fireEvent.press(submit);
  fireEvent.press(view.getByRole('button', { name: 'register.hasAccount register.signIn' }));
  expect(onSubmit).not.toHaveBeenCalled();
  expect(onLogin).not.toHaveBeenCalled();
});
