// i18n.ts (AT PROJECT ROOT - DYNAMIC_JSON_TEST_WITH_UNSTABLE_SET_REQUEST_LOCALE)
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

const locales = ['en', 'pt'];

console.log(`[i18n.ts - ROOT - DYNAMIC_JSON_FINAL_ATTEMPT] TOP LEVEL: File imported/evaluated. Timestamp:`, new Date().toISOString());

export default getRequestConfig(async ({locale}) => {
  console.log(`[i18n.ts - ROOT - DYNAMIC_JSON_FINAL_ATTEMPT] getRequestConfig CALLED for locale: "${locale}". Timestamp:`, new Date().toISOString());

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    console.error(`[i18n.ts - ROOT - DYNAMIC_JSON_FINAL_ATTEMPT] Invalid locale: "${locale}". Calling notFound().`);
    notFound();
  }

  let messages;
  try {
    console.log(`[i18n.ts - ROOT - DYNAMIC_JSON_FINAL_ATTEMPT] Attempting to import messages for locale "${locale}" from "./src/messages/${locale}.json"`);
    messages = (await import(`./src/messages/${locale}.json`)).default;
    console.log(`[i18n.ts - ROOT - DYNAMIC_JSON_FINAL_ATTEMPT] Successfully loaded messages for locale "${locale}". Keys: ${Object.keys(messages || {}).join(', ')}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.error(`[i18n.ts - ROOT - DYNAMIC_JSON_FINAL_ATTEMPT] FAILED to load messages for locale "${locale}" from "./src/messages/${locale}.json". Error: ${errorMessage}. Calling notFound().`);
    notFound();
  }
  
  return {
    messages
  };
});
