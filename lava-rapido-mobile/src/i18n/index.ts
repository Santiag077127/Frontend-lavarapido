/** i18n/index.ts — Configuración i18next (RF10.1) */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import '@formatjs/intl-pluralrules/polyfill';
import '@formatjs/intl-pluralrules/locale-data/es';
import '@formatjs/intl-pluralrules/locale-data/en';
import '@formatjs/intl-pluralrules/locale-data/pt';
import '@formatjs/intl-pluralrules/locale-data/fr';
import es from './locales/es.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import pt from './locales/pt.json';
import { recoveryCopy } from './recoveryCopy';
import { notificationCopy } from './notificationCopy';
import { paymentCopy } from './paymentCopy';
import { emailChangeCopy } from './emailChangeCopy';
import { apiCopy } from './apiCopy';
import { passwordCopy } from './passwordCopy';
import { cancellationCopy } from './cancellationCopy';

type CopyOverlay = {
  accessibility: Record<string, string>;
  forgotPassword: Record<string, string>;
  resetPassword: Record<string, string>;
  register: Record<string, string>;
  changePassword: Record<string, string>;
  notifications: Record<string, unknown>;
  apiErrors: Record<string, string>;
  paymentFlow: Record<string, string>;
  emailChange: Record<string, string>;
  profile: Record<string, string>;
  reservations: Record<string, string>;
  reservation: Record<string, string>;
};

const withRecovery = <T extends { accessibility: Record<string, string>; forgotPassword: Record<string, string>; resetPassword: Record<string, string>; register: Record<string, string>; changePassword: Record<string, string>; notifications: Record<string, unknown>; apiErrors: Record<string, string>; profile: Record<string, unknown>; mobile: { paymentFlow: Record<string, string>; reservations: Record<string, unknown>; reservation: Record<string, unknown> } }>(
  base: T,
  copy: CopyOverlay,
) => ({
  ...base,
  accessibility: { ...base.accessibility, ...copy.accessibility },
  forgotPassword: { ...base.forgotPassword, ...copy.forgotPassword },
  resetPassword: { ...base.resetPassword, ...copy.resetPassword },
  register: { ...base.register, ...copy.register },
  changePassword: { ...base.changePassword, ...copy.changePassword },
  notifications: { ...base.notifications, ...copy.notifications },
  apiErrors: { ...base.apiErrors, ...copy.apiErrors },
  emailChange: { ...copy.emailChange },
  profile: { ...base.profile, ...copy.profile },
  mobile: {
    ...base.mobile,
    reservations: { ...base.mobile.reservations, ...copy.reservations },
    reservation: { ...base.mobile.reservation, ...copy.reservation },
    paymentFlow: { ...base.mobile.paymentFlow, ...copy.paymentFlow },
  },
});

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: withRecovery(es, { ...recoveryCopy.es, ...notificationCopy.es, ...paymentCopy.es, ...apiCopy.es, ...passwordCopy.es, profile: cancellationCopy.es.profile, reservations: cancellationCopy.es.reservations, reservation: cancellationCopy.es.reservation, paymentFlow: { ...paymentCopy.es.paymentFlow, ...cancellationCopy.es.paymentFlow }, resetPassword: { ...recoveryCopy.es.resetPassword, ...passwordCopy.es.resetPassword }, emailChange: emailChangeCopy.es }) },
    en: { translation: withRecovery(en, { ...recoveryCopy.en, ...notificationCopy.en, ...paymentCopy.en, ...apiCopy.en, ...passwordCopy.en, profile: cancellationCopy.en.profile, reservations: cancellationCopy.en.reservations, reservation: cancellationCopy.en.reservation, paymentFlow: { ...paymentCopy.en.paymentFlow, ...cancellationCopy.en.paymentFlow }, resetPassword: { ...recoveryCopy.en.resetPassword, ...passwordCopy.en.resetPassword }, emailChange: emailChangeCopy.en }) },
    fr: { translation: withRecovery(fr, { ...recoveryCopy.fr, ...notificationCopy.fr, ...paymentCopy.fr, ...apiCopy.fr, ...passwordCopy.fr, profile: cancellationCopy.fr.profile, reservations: cancellationCopy.fr.reservations, reservation: cancellationCopy.fr.reservation, paymentFlow: { ...paymentCopy.fr.paymentFlow, ...cancellationCopy.fr.paymentFlow }, resetPassword: { ...recoveryCopy.fr.resetPassword, ...passwordCopy.fr.resetPassword }, emailChange: emailChangeCopy.fr }) },
    pt: { translation: withRecovery(pt, { ...recoveryCopy.pt, ...notificationCopy.pt, ...paymentCopy.pt, ...apiCopy.pt, ...passwordCopy.pt, profile: cancellationCopy.pt.profile, reservations: cancellationCopy.pt.reservations, reservation: cancellationCopy.pt.reservation, paymentFlow: { ...paymentCopy.pt.paymentFlow, ...cancellationCopy.pt.paymentFlow }, resetPassword: { ...recoveryCopy.pt.resetPassword, ...passwordCopy.pt.resetPassword }, emailChange: emailChangeCopy.pt }) },
  },
  lng: 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
});

export const LANGUAGE_STORAGE_KEY = '@lava-rapido/language';
export const SUPPORTED_LANGUAGES = ['es', 'en', 'pt', 'fr'] as const;
export type LanguageCode = typeof SUPPORTED_LANGUAGES[number];

export async function initializeLanguage(): Promise<LanguageCode> {
  const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  const language = SUPPORTED_LANGUAGES.includes(storedLanguage as LanguageCode)
    ? storedLanguage as LanguageCode
    : 'es';

  if (i18n.language !== language) {
    await i18n.changeLanguage(language);
  }

  return language;
}

export async function changeLanguage(language: LanguageCode): Promise<void> {
  await i18n.changeLanguage(language);
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}

export default i18n;
