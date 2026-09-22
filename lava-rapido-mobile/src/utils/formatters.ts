/** formatters.ts — Formateo de fechas y montos */
import i18n from '../i18n';

const locales = { es: 'es-CO', en: 'en-US', pt: 'pt-BR', fr: 'fr-FR' } as const;
const getLocale = () => locales[i18n.resolvedLanguage as keyof typeof locales] ?? locales.es;

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat(getLocale(), { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);

export const formatDate = (date: string | Date) =>
  new Intl.DateTimeFormat(getLocale(), { dateStyle: 'long', timeStyle: 'short' }).format(new Date(date));
