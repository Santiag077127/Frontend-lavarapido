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

i18n.use(initReactI18next).init({
  resources: { es: { translation: es }, en: { translation: en }, fr: { translation: fr }, pt: { translation: pt } },
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
