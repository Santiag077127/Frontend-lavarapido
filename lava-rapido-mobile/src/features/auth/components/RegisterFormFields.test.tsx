import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { RegisterCredentialFields, RegisterPersonalInformationFields } from './RegisterFormFields';

jest.mock('@expo/vector-icons', () => ({ Feather: () => null, Ionicons: () => null, MaterialIcons: () => null }));

const theme = {
  icon: '#666', border: '#ddd', inputBackground: '#fff', errorText: '#c00', placeholder: '#999', text: '#111',
  primaryDark: '#06c', onPrimary: '#fff', surface: '#f5f5f5', textSecondary: '#666', successText: '#080',
};
const translate = (key: string) => key;

test('renders personal fields, reports email feedback, and forwards edits and document selection', () => {
  const onEmailChange = jest.fn();
  const onDocumentTypeChange = jest.fn();
  const onDocumentNumberChange = jest.fn();
  const view = render(<RegisterPersonalInformationFields
    theme={theme} translate={translate} email="bad" emailFormatError firstName="Ana" lastName="Pérez"
    phoneNumber="3001234567" documentType="CC" documentNumber="123"
    onEmailChange={onEmailChange} onEmailBlur={jest.fn()} onFirstNameChange={jest.fn()}
    onLastNameChange={jest.fn()} onPhoneChange={jest.fn()} onDocumentTypeChange={onDocumentTypeChange}
    onDocumentNumberChange={onDocumentNumberChange}
  />);

  expect(view.getByLabelText('register.firstName').props.value).toBe('Ana');
  expect(view.getByLabelText('register.lastName').props.value).toBe('Pérez');
  expect(view.getByLabelText('register.phone').props.value).toBe('3001234567');
  expect(view.getByRole('alert')).toHaveTextContent('register.invalidEmail');
  fireEvent.changeText(view.getByLabelText('register.email'), 'ana@example.com');
  fireEvent.press(view.getByRole('radio', { name: 'register.documentType: TI' }));
  fireEvent.changeText(view.getByLabelText('register.documentNumber'), '456');
  expect(onEmailChange).toHaveBeenCalledWith('ana@example.com');
  expect(onDocumentTypeChange).toHaveBeenCalledWith('TI');
  expect(onDocumentNumberChange).toHaveBeenCalledWith('456');
});

test('renders password requirements, confirmation feedback, and accessible visibility controls', () => {
  const onTogglePassword = jest.fn();
  const onSubmitEditing = jest.fn();
  const view = render(<RegisterCredentialFields
    theme={theme} translate={translate} password="short" confirmPassword="different" passwordBytes={5}
    confirmationMatches={false} showPassword={false} showConfirmPassword={false}
    onPasswordChange={jest.fn()} onConfirmPasswordChange={jest.fn()} onTogglePassword={onTogglePassword}
    onToggleConfirmPassword={jest.fn()} onSubmitEditing={onSubmitEditing}
  />);

  expect(view.getByLabelText('register.password').props.secureTextEntry).toBe(true);
  expect(view.getByLabelText('register.confirmPassword').props.secureTextEntry).toBe(true);
  expect(view.getByText('register.minLength')).toBeTruthy();
  expect(view.getByText(/register\.passwordsDoNotMatch/)).toBeTruthy();
  fireEvent.press(view.getAllByRole('button', { name: 'accessibility.showPassword' })[0]);
  fireEvent(view.getByLabelText('register.confirmPassword'), 'submitEditing');
  expect(onTogglePassword).toHaveBeenCalledTimes(1);
  expect(onSubmitEditing).toHaveBeenCalledTimes(1);
});
