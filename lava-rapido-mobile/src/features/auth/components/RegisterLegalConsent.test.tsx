import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import RegisterLegalConsent from './RegisterLegalConsent';
import RegisterLegalDocumentModal from './RegisterLegalDocumentModal';

const consentProps = {
  acceptsPrivacy: false,
  acceptsTerms: false,
  borderColor: '#ddd',
  inputBackground: '#fff',
  primaryColor: '#06c',
  onTogglePrivacy: jest.fn(),
  onToggleTerms: jest.fn(),
  onOpenDocument: jest.fn(),
  textColor: '#111',
  onPrimaryColor: '#fff',
};

beforeEach(() => jest.clearAllMocks());

test('routes consent toggles and legal document links to screen callbacks', () => {
  const view = render(<RegisterLegalConsent {...consentProps} />);

  fireEvent.press(view.getByRole('checkbox', { name: 'He leído la política de privacidad' }));
  fireEvent.press(view.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }));
  fireEvent.press(view.getByRole('link', { name: 'Política de privacidad' }));
  fireEvent.press(view.getByRole('link', { name: 'Términos y condiciones' }));

  expect(consentProps.onTogglePrivacy).toHaveBeenCalledTimes(1);
  expect(consentProps.onToggleTerms).toHaveBeenCalledTimes(1);
  expect(consentProps.onOpenDocument).toHaveBeenNthCalledWith(1, 'privacy');
  expect(consentProps.onOpenDocument).toHaveBeenNthCalledWith(2, 'terms');
});

test.each([
  ['privacy', 'Política de privacidad', '1. Datos tratados'],
  ['terms', 'Términos y condiciones', '5. Reservas y pagos'],
] as const)('renders %s document and closes it', (document, title, section) => {
  const onClose = jest.fn();
  const view = render(
    <RegisterLegalDocumentModal
      document={document}
      onClose={onClose}
      surfaceColor="#fff"
      textColor="#111"
      secondaryTextColor="#666"
      buttonColor="#06c"
      onPrimaryColor="#fff"
    />,
  );

  expect(view.getByRole('header')).toHaveTextContent(title);
  expect(view.getByText(section)).toBeTruthy();
  fireEvent.press(view.getByRole('button', { name: 'Cerrar' }));
  expect(onClose).toHaveBeenCalledTimes(1);
});
