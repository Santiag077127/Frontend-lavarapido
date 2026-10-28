import React from 'react';
import { render } from '@testing-library/react-native';
import es from '../../../i18n/locales/es.json';
import en from '../../../i18n/locales/en.json';
import fr from '../../../i18n/locales/fr.json';
import pt from '../../../i18n/locales/pt.json';
import { legalContent } from '../legalContent';
import RegisterLegalDocumentModal from './RegisterLegalDocumentModal';

const localizedTerms = { es: es.legal.terms, en: en.legal.terms, fr: fr.legal.terms, pt: pt.legal.terms };
const localizedFinalSection = {
  es: es.legal.paymentInterruption,
  en: en.legal.paymentInterruption,
  fr: fr.legal.paymentInterruption,
  pt: pt.legal.paymentInterruption,
};
const sectionSlugs = [
  'acceptance', 'service', 'permittedUse', 'accountSecurity', 'bookingsPayments',
  'voluntaryCancellation', 'refundsConsumerRights', 'availability', 'content',
] as const;
let mockLocale: keyof typeof localizedTerms = 'es';

const mockTranslate = (key: string) => {
  if (key === 'language.close') return 'Close';
  if (key === 'legal.terms.title') return localizedTerms[mockLocale].title;
  if (key === 'legal.terms.intro') return localizedTerms[mockLocale].intro;
  if (key === 'legal.paymentInterruption.title') return localizedFinalSection[mockLocale].title;
  if (key === 'legal.paymentInterruption.body') return localizedFinalSection[mockLocale].body;
  const match = key.match(/^legal\.terms\.sections\.([^.]+)\.(title|body)$/);
  if (!match) return key;
  const section = localizedTerms[mockLocale].sections[match[1] as keyof typeof localizedTerms.es.sections];
  return section[match[2] as 'title' | 'body'];
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => mockTranslate(key) }),
}));

const modalProps = {
  document: 'terms' as const,
  onClose: jest.fn(),
  surfaceColor: '#fff',
  textColor: '#111',
  secondaryTextColor: '#666',
  buttonColor: '#06c',
  onPrimaryColor: '#fff',
};

beforeEach(() => { mockLocale = 'es'; });

test.each(Object.entries(localizedTerms))('%s contains all localized terms clauses 1 to 9', (locale, terms) => {
  expect(terms.title.trim()).not.toBe('');
  expect(terms.intro.trim()).not.toBe('');
  expect(Object.keys(terms.sections)).toEqual(sectionSlugs);
  for (const [index, slug] of sectionSlugs.entries()) {
    const section = terms.sections[slug];
    expect(section.title).toMatch(new RegExp(`^${index + 1}\\.`));
    expect(section.body.trim().length).toBeGreaterThan(40);
    expect(legalContent.terms.sections[index].titleKey).toBe(`legal.terms.sections.${slug}.title`);
    expect(legalContent.terms.sections[index].bodyKey).toBe(`legal.terms.sections.${slug}.body`);
  }
  const finalSection = localizedFinalSection[locale as keyof typeof localizedFinalSection];
  expect(finalSection.title).toMatch(/^10\./);
  expect(finalSection.body.trim().length).toBeGreaterThan(100);
});

test('Spanish title, introduction, and clauses 1 to 9 match the shared Spanish source exactly', () => {
  expect(es.legal.terms.title).toBe(legalContent.terms.title);
  expect(es.legal.terms.intro).toBe(legalContent.terms.intro);
  expect(sectionSlugs.map((slug) => es.legal.terms.sections[slug])).toEqual(
    legalContent.terms.sections.slice(0, 9).map(({ title, body }) => ({ title, body })),
  );
});

test.each(['en', 'fr', 'pt'] as const)('%s clauses do not fall back to Spanish copy', (locale) => {
  const translated = localizedTerms[locale];
  expect(translated.title).not.toBe(es.legal.terms.title);
  expect(translated.intro).not.toBe(es.legal.terms.intro);
  for (const slug of sectionSlugs) {
    expect(translated.sections[slug].title).not.toBe(es.legal.terms.sections[slug].title);
    expect(translated.sections[slug].body).not.toBe(es.legal.terms.sections[slug].body);
    expect(translated.sections[slug].body).not.toContain('La plataforma permite consultar');
  }
});

test('the complete document changes language in the shared registration modal', () => {
  const view = render(<RegisterLegalDocumentModal {...modalProps} />);
  expect(view.getByRole('header')).toHaveTextContent(es.legal.terms.title);
  expect(view.getByText(es.legal.terms.sections.acceptance.body)).toBeTruthy();
  expect(view.getByText(es.legal.paymentInterruption.title)).toBeTruthy();

  mockLocale = 'en';
  view.rerender(<RegisterLegalDocumentModal {...modalProps} />);
  expect(view.getByRole('header')).toHaveTextContent(en.legal.terms.title);
  expect(view.getByText(en.legal.terms.sections.acceptance.body)).toBeTruthy();
  expect(view.getByText(en.legal.terms.sections.content.body)).toBeTruthy();
  expect(view.getByText(en.legal.paymentInterruption.title)).toBeTruthy();
  expect(view.getByText(en.legal.paymentInterruption.body)).toBeTruthy();
  expect(view.queryByText(es.legal.terms.sections.acceptance.body)).toBeNull();

  mockLocale = 'fr';
  view.rerender(<RegisterLegalDocumentModal {...modalProps} />);
  expect(view.getByRole('header')).toHaveTextContent(fr.legal.terms.title);
  expect(view.getByText(fr.legal.terms.sections.acceptance.body)).toBeTruthy();
  expect(view.getByText(fr.legal.paymentInterruption.body)).toBeTruthy();

  mockLocale = 'pt';
  view.rerender(<RegisterLegalDocumentModal {...modalProps} />);
  expect(view.getByRole('header')).toHaveTextContent(pt.legal.terms.title);
  expect(view.getByText(pt.legal.terms.sections.acceptance.body)).toBeTruthy();
  expect(view.getByText(pt.legal.paymentInterruption.body)).toBeTruthy();
});
