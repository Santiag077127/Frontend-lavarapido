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

const withRecovery = <T extends { forgotPassword: Record<string, string>; resetPassword: Record<string, string>; notifications: Record<string, unknown>; mobile: { paymentFlow: Record<string, string> } }>(
  base: T,
  copy: (typeof recoveryCopy.es | typeof recoveryCopy.en | typeof recoveryCopy.fr | typeof recoveryCopy.pt) & (typeof notificationCopy.es | typeof notificationCopy.en | typeof notificationCopy.fr | typeof notificationCopy.pt) & (typeof paymentCopy.es | typeof paymentCopy.en | typeof paymentCopy.fr | typeof paymentCopy.pt),
) => ({
  ...base,
  forgotPassword: { ...base.forgotPassword, ...copy.forgotPassword },
  resetPassword: { ...base.resetPassword, ...copy.resetPassword },
  notifications: { ...base.notifications, ...copy.notifications },
  mobile: { ...base.mobile, paymentFlow: { ...base.mobile.paymentFlow, ...copy.paymentFlow } },
});

i18n.use(initReactI18next).init({
  resources: { es: { translation: withRecovery(es, { ...recoveryCopy.es, ...notificationCopy.es, ...paymentCopy.es }) }, en: { translation: withRecovery(en, { ...recoveryCopy.en, ...notificationCopy.en, ...paymentCopy.en }) }, fr: { translation: withRecovery(fr, { ...recoveryCopy.fr, ...notificationCopy.fr, ...paymentCopy.fr }) }, pt: { translation: withRecovery(pt, { ...recoveryCopy.pt, ...notificationCopy.pt, ...paymentCopy.pt }) } },
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
