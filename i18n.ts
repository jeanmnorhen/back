// i18n.ts (AT PROJECT ROOT - MINIMAL HARDCODED TEST)
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

const locales = ['en', 'pt'];

console.log(`[i18n.ts - ROOT - MINIMAL_HARDCODED_TEST] TOP LEVEL: File imported/evaluated. Timestamp:`, new Date().toISOString());

export default getRequestConfig(async ({locale}) => {
  console.log(`[i18n.ts - ROOT - MINIMAL_HARDCODED_TEST] getRequestConfig CALLED for locale: "${locale}". Timestamp:`, new Date().toISOString());

  if (!locales.includes(locale as any)) {
    console.error(`[i18n.ts - ROOT - MINIMAL_HARDCODED_TEST] Invalid locale: "${locale}". Calling notFound().`);
    notFound();
  }

  let messages;
  if (locale === 'en') {
    messages = {
      MinimalPage: {
        greeting: "Hello from Minimal English Page!",
        title: "Minimal English Title"
      },
      Layout: { // Required by NextIntlClientProvider if metadata isn't providing it
        title: "Minimal Layout EN",
        description: "Minimal Layout EN desc"
      }
    };
    console.log(`[i18n.ts - ROOT - MINIMAL_HARDCODED_TEST] Assigned EN messages for locale "${locale}"`);
  } else if (locale === 'pt') {
    messages = {
      MinimalPage: {
        greeting: "Olá da Página Mínima em Português!",
        title: "Título Mínimo em Português"
      },
      Layout: {
        title: "Layout Mínimo PT",
        description: "Layout Mínimo PT desc"
      }
    };
    console.log(`[i18n.ts - ROOT - MINIMAL_HARDCODED_TEST] Assigned PT messages for locale "${locale}"`);
  } else {
    console.error(`[i18n.ts - ROOT - MINIMAL_HARDCODED_TEST] Unhandled locale: "${locale}". This should not happen.`);
    return {
      messages: { MinimalPage: { greeting: "Error: Unhandled Locale", title: "Error" } }
    };
  }

  console.log(`[i18n.ts - ROOT - MINIMAL_HARDCODED_TEST] Returning messages for locale "${locale}".`);
  return {
    messages
  };
});