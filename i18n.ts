// i18n.ts (AT PROJECT ROOT - DYNAMIC JSON LOADING TEST)
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

const locales = ['en', 'pt'];

console.log(`[i18n.ts - ROOT - DYNAMIC_JSON_TEST] TOP LEVEL: File imported/evaluated. Timestamp:`, new Date().toISOString());

export default getRequestConfig(async ({locale}) => {
  console.log(`[i18n.ts - ROOT - DYNAMIC_JSON_TEST] getRequestConfig CALLED for locale: "${locale}". Timestamp:`, new Date().toISOString());

  if (!locales.includes(locale as any)) {
    console.error(`[i18n.ts - ROOT - DYNAMIC_JSON_TEST] Invalid locale: "${locale}". Calling notFound().`);
    notFound();
  }

  let messages;
  try {
    console.log(`[i18n.ts - ROOT - DYNAMIC_JSON_TEST] Attempting to import messages for locale "${locale}" from "./src/messages/${locale}.json"`);
    messages = (await import(`./src/messages/${locale}.json`)).default;
    console.log(`[i18n.ts - ROOT - DYNAMIC_JSON_TEST] SUCCESSFULLY imported messages for locale "${locale}". Message keys: ${Object.keys(messages || {}).join(', ')}`);
  } catch (error: any) {
    // Simplified error logging
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[i18n.ts - ROOT - DYNAMIC_JSON_TEST] FAILED to load messages for locale "${locale}" from "./src/messages/${locale}.json". Error: ${errorMessage}`);
    notFound();
  }
  
  console.log(`[i18n.ts - ROOT - DYNAMIC_JSON_TEST] Returning messages for locale "${locale}".`);
  return {
    messages
  };
});
