import en from './en.json';
import fil from './fil.json';

export type TranslationKey = keyof typeof en;

/** To add a language: add its JSON file here and one entry in LOCALES. */
const dictionaries = {
  en,
  fil: fil satisfies Record<TranslationKey, string>,
};

export type Locale = keyof typeof dictionaries;

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'fil', label: 'Filipino (Tagalog)' },
];

let current: Locale = 'en';

export const getLocale = (): Locale => current;

export function setLocale(locale: Locale): void {
  current = locale;
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && value in dictionaries;
}

/** Looks up a UI string in the current language and fills in {placeholders}. */
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const template: string = dictionaries[current][key];
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}
