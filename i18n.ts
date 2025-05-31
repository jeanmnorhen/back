// i18n.ts (AT PROJECT ROOT - HARCODED MESSAGES - ABSOLUTE MINIMAL TEST)
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

const locales = ['en', 'pt'];

console.log(`[i18n.ts - ROOT - HARCODED_MESSAGES_TEST] TOP LEVEL: File imported/evaluated. Timestamp:`, new Date().toISOString());

// Hardcoded messages
const enMessages = {
  MinimalPage: {
    greeting: "Hello from Minimal English Page!",
    title: "Minimal English Title"
  },
  Layout: {
    title: "Layout (EN - Hardcoded)"
  }
};

const ptMessages = {
  MinimalPage: {
    greeting: "Olá da Página Mínima em Português!",
    title: "Título Mínimo em Português"
  },
  Layout: {
    title: "Layout (PT - Hardcoded)"
  }
};

export default getRequestConfig(async ({locale}) => {
  console.log(`[i18n.ts - ROOT - HARCODED_MESSAGES_TEST] getRequestConfig CALLED for locale: "${locale}". Timestamp:`, new Date().toISOString());

  if (!locales.includes(locale as any)) {
    console.error(`[i18n.ts - ROOT - HARCODED_MESSAGES_TEST] Invalid locale: "${locale}". Calling notFound().`);
    notFound();
  }

  let messages;
  if (locale === 'en') {
    messages = enMessages;
  } else if (locale === 'pt') {
    messages = ptMessages;
  } else {
    console.error(`[i18n.ts - ROOT - HARCODED_MESSAGES_TEST] Unknown locale for message loading: "${locale}" - defaulting to PT`);
    messages = ptMessages; // Default to PT messages
  }
  
  console.log(`[i18n.ts - ROOT - HARCODED_MESSAGES_TEST] Returning messages for locale "${locale}".`);
  return {
    messages
  };
});
