// i18n.ts (AT PROJECT ROOT - MINIMAL DYNAMIC IMPORT TEST)
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

const locales = ['en', 'pt'];

console.log(`[i18n.ts - ROOT - MINIMAL_DYNAMIC_IMPORT_TEST] TOP LEVEL: File imported/evaluated. Timestamp:`, new Date().toISOString());

export default getRequestConfig(async ({locale}) => {
  console.log(`[i18n.ts - ROOT - MINIMAL_DYNAMIC_IMPORT_TEST] getRequestConfig CALLED for locale: "${locale}". Timestamp:`, new Date().toISOString());

  if (!locales.includes(locale as any)) {
    console.error(`[i18n.ts - ROOT - MINIMAL_DYNAMIC_IMPORT_TEST] Invalid locale: "${locale}". Calling notFound().`);
    notFound();
  }

  let messages;
  try {
    // Path is relative to the project root, where i18n.ts is located.
    console.log(`[i18n.ts - ROOT - MINIMAL_DYNAMIC_IMPORT_TEST] Attempting to import messages for locale "${locale}" from "./src/messages/${locale}.json"`);
    messages = (await import(`./src/messages/${locale}.json`)).default;
    console.log(`[i18n.ts - ROOT - MINIMAL_DYNAMIC_IMPORT_TEST] Successfully imported messages for locale "${locale}"`);
  } catch (error) {
    console.error(`[i18n.ts - ROOT - MINIMAL_DYNAMIC_IMPORT_TEST] FAILED to load messages for locale "${locale}" from "./src/messages/${locale}.json":`, error);
    notFound();
  }

  console.log(`[i18n.ts - ROOT - MINIMAL_DYNAMIC_IMPORT_TEST] Returning messages for locale "${locale}".`);
  return {
    messages
  };
});
