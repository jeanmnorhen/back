import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

const locales = ['en', 'pt'];
const defaultLocale = 'pt';

i18n
  .use(HttpApi) // For loading translations from a path
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Passes i18n instance to react-i18next
  .init({
    // debug: process.env.NODE_ENV === 'development', // Uncomment to debug
    supportedLngs: locales,
    fallbackLng: defaultLocale,
    detection: {
      // Order and from where user language should be detected
      order: ['path', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'], // Where to cache detected language
      lookupFromPathIndex: 0, // Example: /en/path will use 'en'
      cookie: 'i18next', // Name of the cookie
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json', // Path to translation files in `public` folder
    },
    react: {
      useSuspense: false, // Set to false to avoid Suspense for translations (simpler setup initially)
    },
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
  });

export default i18n;
