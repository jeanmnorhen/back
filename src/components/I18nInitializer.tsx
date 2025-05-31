'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n'; // Import the configured i18n instance

interface I18nInitializerProps {
  locale: string;
}

export default function I18nInitializer({ locale }: I18nInitializerProps) {
  const { i18n: i18nInstanceFromHook } = useTranslation(); // Get i18n instance from context

  useEffect(() => {
    // Ensure the i18n instance from the hook (which should be the global one)
    // is updated if the locale from the path changes.
    if (i18nInstanceFromHook.language !== locale) {
      console.log(`[I18nInitializer] Current i18n language: ${i18nInstanceFromHook.language}, Path locale: ${locale}. Changing language.`);
      i18nInstanceFromHook.changeLanguage(locale).catch(err => {
        console.error('[I18nInitializer] Error changing language:', err);
      });
    } else {
      console.log(`[I18nInitializer] i18n language (${i18nInstanceFromHook.language}) matches path locale (${locale}). No change needed.`);
    }
  }, [locale, i18nInstanceFromHook]);

  useEffect(() => {
    // Fallback: If the global instance (imported directly) is somehow out of sync
    // This might be redundant if LanguageDetector and path lookup work correctly
    if (i18n.language !== locale) {
      console.warn(`[I18nInitializer] Global i18n instance language (${i18n.language}) out of sync with path locale (${locale}). Forcing change. This might indicate an issue with LanguageDetector or provider setup.`);
      i18n.changeLanguage(locale).catch(err => {
         console.error('[I18nInitializer] Error changing language on global instance:', err);
      });
    }
  }, [locale]);

  return null; // This component only handles side effects
}
