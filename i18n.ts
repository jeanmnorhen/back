// i18n.ts (AT PROJECT ROOT - HARDCODED MESSAGES TEST with unstable_setRequestLocale)
import {getRequestConfig} from 'next-intl/server';

const locales = ['en', 'pt'];

console.log(`[i18n.ts - ROOT - HARDCODED_SET_REQUEST_LOCALE_TEST] TOP LEVEL: File imported/evaluated. Timestamp:`, new Date().toISOString());

export default getRequestConfig(({locale}) => {
  console.log(`[i18n.ts - ROOT - HARDCODED_SET_REQUEST_LOCALE_TEST] getRequestConfig CALLED for locale: "${locale}". Timestamp:`, new Date().toISOString());

  if (!locales.includes(locale as any)) {
    console.error(`[i18n.ts - ROOT - HARDCODED_SET_REQUEST_LOCALE_TEST] Invalid locale: "${locale}".`);
    // For simplicity in this test, we won't call notFound() here,
    // as the primary goal is to see if getMessages() works.
    // In a real scenario, you would call notFound().
  }

  // Using hardcoded messages for this test
  let messages;
  if (locale === 'en') {
    messages = {
      MinimalPage: {
        title: "Minimal English Title (Hardcoded)",
        greeting: "Hello from Minimal English Page! (Hardcoded)"
      },
      Layout: {
        title: "Layout (EN - Hardcoded)"
      }
    };
  } else if (locale === 'pt') {
    messages = {
      MinimalPage: {
        title: "Título Mínimo em Português (Hardcoded)",
        greeting: "Olá da Página Mínima em Português! (Hardcoded)"
      },
      Layout: {
        title: "Layout (PT - Hardcoded)"
      }
    };
  } else {
    messages = {}; // Should not happen if locale validation is robust
  }
  
  console.log(`[i18n.ts - ROOT - HARDCODED_SET_REQUEST_LOCALE_TEST] Returning hardcoded messages for locale "${locale}".`);
  return {
    messages
  };
});
