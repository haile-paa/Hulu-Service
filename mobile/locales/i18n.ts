import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import am from './am.json';
import en from './en.json';

// Defaults to Amharic; the user can toggle to English via TopBar (see
// LanguageContext), which persists the choice and calls i18n.changeLanguage.
export const initI18n = async () => {
  await i18n.use(initReactI18next).init({
    resources: {
      am: { translation: am },
      en: { translation: en },
    },
    lng: 'am',
    fallbackLng: 'am',
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v3',
  });

  return i18n;
};

export default i18n;
