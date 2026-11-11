import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { getLocale, isLocale, setLocale, type Locale } from '@/i18n';

const STORAGE_KEY = 'fixlab.language.v1';

interface LanguageState {
  ready: boolean;
  locale: Locale;
  changeLanguage: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageState | null>(null);

function deviceLocale(): Locale {
  const code = getLocales()[0]?.languageCode;
  // Android reports Filipino as either "fil" or the older "tl".
  return code === 'fil' || code === 'tl' ? 'fil' : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [locale, setLocaleState] = useState<Locale>(getLocale);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .catch(() => null)
      .then((saved) => {
        const initial = isLocale(saved) ? saved : deviceLocale();
        setLocale(initial);
        setLocaleState(initial);
        setReady(true);
      });
  }, []);

  const changeLanguage = useCallback((next: Locale) => {
    setLocale(next);
    setLocaleState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch((error: unknown) => {
      console.warn('Could not save language', error);
    });
  }, []);

  const value = useMemo(
    () => ({ ready, locale, changeLanguage }),
    [ready, locale, changeLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageState {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used inside LanguageProvider');
  return value;
}
