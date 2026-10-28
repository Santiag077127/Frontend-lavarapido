import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import RegisterLegalConsent from './RegisterLegalConsent';
import RegisterLegalDocumentModal from './RegisterLegalDocumentModal';
import es from '../../../i18n/locales/es.json';
import en from '../../../i18n/locales/en.json';
import fr from '../../../i18n/locales/fr.json';
import pt from '../../../i18n/locales/pt.json';
import { legalContent } from '../legalContent';
const mockTranslate = (key: string) => {
  if (key === 'language.close') return 'Cerrar';
  if (key === 'legal.terms.title') return es.legal.terms.title;
  if (key === 'legal.terms.intro') return es.legal.terms.intro;
  if (key === 'legal.paymentInterruption.title') return es.legal.paymentInterruption.title;
  if (key === 'legal.paymentInterruption.body') return es.legal.paymentInterruption.body;
  const match = key.match(/^legal\.terms\.sections\.([^.]+)\.(title|body)$/);
  return match ? es.legal.terms.sections[match[1] as keyof typeof es.legal.terms.sections][match[2] as 'title' | 'body'] : key;
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => mockTranslate(key) }),
}));

const paymentTerms = { es: es.legal.paymentInterruption, en: en.legal.paymentInterruption, fr: fr.legal.paymentInterruption, pt: pt.legal.paymentInterruption };
const paymentReminder = {
  es: es.mobile.paymentFlow,
  en: en.mobile.paymentFlow,
  fr: fr.mobile.paymentFlow,
  pt: pt.mobile.paymentFlow,
};
const expectedSpanishTitle = '10. Pagos interrumpidos y pol\u00edtica de devoluciones';
const expectedSpanishBody = [
  'Si durante el proceso de pago se pierde la conexi\u00f3n a Internet, se cierra la aplicaci\u00f3n o se interrumpe la comunicaci\u00f3n con la plataforma de pagos, la transacci\u00f3n podr\u00eda completarse aunque la reserva contin\u00fae apareciendo como pendiente.',
  'El usuario deber\u00e1 verificar el estado de su reserva antes de intentar realizar otro pago.',
  'Los pagos aprobados no generan devoluciones autom\u00e1ticas por interrupciones de conexi\u00f3n, cierre de la aplicaci\u00f3n o desistimiento del usuario. Las devoluciones \u00fanicamente proceder\u00e1n cuando sean legalmente obligatorias, de conformidad con la normativa colombiana aplicable.',
].join('\n\n');

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
  if (document === 'terms') {
    expect(view.getByText('6. Cancelación voluntaria')).toBeTruthy();
    expect(view.getByText('7. Reembolsos y derechos del consumidor')).toBeTruthy();
    expect(view.getByText(expectedSpanishTitle)).toBeTruthy();
    expect(view.getByText(expectedSpanishBody)).toBeTruthy();
  }
  fireEvent.press(view.getByRole('button', { name: 'Cerrar' }));
  expect(onClose).toHaveBeenCalledTimes(1);
});


test('Spanish section 10 matches the supplied title and paragraphs literally', () => {
  expect(paymentTerms.es.title).toBe(expectedSpanishTitle);
  expect(paymentTerms.es.body).toBe(expectedSpanishBody);
});

test.each(Object.entries(paymentTerms))('%s section 10 has complete localized terms', (locale, entry) => {
  expect(entry.title).toMatch(/^10\./);
  expect(entry.body.split('\n\n')).toHaveLength(3);
  expect(entry.body.toLowerCase()).toMatch(/colomb/);
  expect(entry.body.toLowerCase()).toMatch(/legal|required|obligatoire|obrigat/);
  expect(entry.body.toLowerCase()).not.toMatch(/contact|support|service client|contate|fale com|atendimento|suporte/);
  expect(locale).toMatch(/^(es|en|fr|pt)$/);
});

test.each(Object.entries(paymentReminder))('%s payment reminder is translated and links to the shared terms source', (locale, copy) => {
  expect(copy.termsReminderTitle).toBeTruthy();
  expect(copy.termsReminderIntro).toBeTruthy();
  expect(copy.termsReminderWarning).toBeTruthy();
  expect(copy.termsConsent).toBeTruthy();
  expect(copy.termsCancel).toBeTruthy();
  expect(copy.termsContinue).toBeTruthy();
  expect(copy.termsRead).toBeTruthy();
  expect(locale).toMatch(/^(es|en|fr|pt)$/);
  expect(legalContent.terms.sections[9].titleKey).toBe('legal.paymentInterruption.title');
  expect(legalContent.terms.sections[9].bodyKey).toBe('legal.paymentInterruption.body');
});

test('terms sections 1 to 9 remain in their existing order', () => {
  expect(legalContent.terms.sections).toHaveLength(10);
  expect(legalContent.terms.sections.slice(0, 9).map(({ title }) => title)).toEqual([
    "1. Aceptación",
    "2. Servicio",
    "3. Uso permitido",
    "4. Cuenta y seguridad",
    "5. Reservas y pagos",
    "6. Cancelación voluntaria",
    "7. Reembolsos y derechos del consumidor",
    "8. Disponibilidad",
    "9. Contenido",
  ]);
  expect(legalContent.terms.sections[9].title).toBe(expectedSpanishTitle);
});
