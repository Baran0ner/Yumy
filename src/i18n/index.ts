import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { AppLanguage } from '../types/firestore';
import { resources } from './resources';

export type SupportedLanguage = 'tr' | 'en';

const getDeviceLanguage = (): SupportedLanguage => {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase();
  return locale.startsWith('tr') ? 'tr' : 'en';
};

export const resolveLanguage = (preference: AppLanguage | undefined): SupportedLanguage => {
  if (preference === 'tr' || preference === 'en') {
    return preference;
  }

  return getDeviceLanguage();
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
  });
}

export const applyPreferredLanguage = async (preference: AppLanguage | undefined): Promise<void> => {
  const next = resolveLanguage(preference);

  if (i18n.language !== next) {
    await i18n.changeLanguage(next);
  }
};

export const getCurrentLocale = (): string => {
  const language = i18n.language.toLowerCase();
  return language.startsWith('tr') ? 'tr-TR' : 'en-US';
};

export default i18n;
