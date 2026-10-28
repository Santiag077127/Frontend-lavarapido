import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import PaymentTermsConsentModal from './PaymentTermsConsentModal';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => ({
    'mobile.paymentFlow.termsReminderTitle': 'Before continuing with payment',
    'mobile.paymentFlow.termsConsent': 'I have read and accept the terms and conditions.',
    'mobile.paymentFlow.termsContinue': 'Continue to payment',
    'mobile.paymentFlow.termsCancel': 'Cancel',
    'mobile.paymentFlow.termsRead': 'Read terms and conditions',
    'mobile.paymentFlow.termsReminderIntro': 'Read and accept before continuing.',
    'mobile.paymentFlow.termsReminderWarning': 'Check your booking before paying again.',
  }[key] ?? key) }),
}));

const renderConsent = (colors = {
  surfaceColor: '#151F32', textColor: '#F8FAFC', secondaryTextColor: '#DBE4F0',
  borderColor: '#263244', buttonColor: '#1565C0', onPrimaryColor: '#FFFFFF',
}) => {
  const onCancel = jest.fn();
  const onContinue = jest.fn();
  const onReadTerms = jest.fn();
  const view = render(
    <PaymentTermsConsentModal
      visible
      {...colors}
      onCancel={onCancel}
      onContinue={onContinue}
      onReadTerms={onReadTerms}
    />,
  );
  return { view, onCancel, onContinue, onReadTerms, colors };
};

test('requires an accessible, initially unchecked checkbox before continuing', () => {
  const { view, onContinue, onReadTerms } = renderConsent();
  const checkbox = view.getByRole('checkbox', { name: 'I have read and accept the terms and conditions.' });
  expect(checkbox.props.accessibilityState.checked).toBe(false);
  expect(view.getByRole('button', { name: 'Continue to payment' }).props.accessibilityState.disabled).toBe(true);

  fireEvent.press(view.getByRole('link', { name: 'Read terms and conditions' }));
  expect(onReadTerms).toHaveBeenCalledTimes(1);
  expect(onContinue).not.toHaveBeenCalled();

  fireEvent.press(checkbox);
  expect(view.getByRole('checkbox', { name: 'I have read and accept the terms and conditions.' }).props.accessibilityState.checked).toBe(true);
  fireEvent.press(view.getByRole('button', { name: 'Continue to payment' }));
  expect(onContinue).toHaveBeenCalledTimes(1);
});

test('cancel closes without accepting and controls use the active theme tokens', () => {
  const { view, onCancel, colors } = renderConsent({
    surfaceColor: '#F4F7FB', textColor: '#0D1B3E', secondaryTextColor: '#4A5568',
    borderColor: '#DDE4EF', buttonColor: '#1565C0', onPrimaryColor: '#FFFFFF',
  });
  fireEvent.press(view.getByRole('button', { name: 'Cancel' }));
  expect(onCancel).toHaveBeenCalledTimes(1);
  expect(StyleSheet.flatten(view.getByRole('button', { name: 'Continue to payment' }).props.style))
    .toMatchObject({ backgroundColor: colors.buttonColor });
  expect(StyleSheet.flatten(view.getByTestId('payment-terms-checkbox-indicator').props.style))
    .toMatchObject({ backgroundColor: 'transparent', borderColor: colors.borderColor });
});
