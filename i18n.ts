// i18n.ts (AT PROJECT ROOT)
console.log(`[i18n.ts - ROOT] TOP LEVEL: File imported/evaluated. Timestamp:`, new Date().toISOString());

import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// Can be imported from a shared config
const locales = ['en', 'pt'];

export default getRequestConfig(async ({locale}) => {
  console.log(`[i18n.ts - ROOT] getRequestConfig CALLED for locale: "${locale}". Timestamp:`, new Date().toISOString());

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    console.error(`[i18n.ts - ROOT] Invalid locale received: "${locale}". Supported: ${locales.join(', ')}. Calling notFound().`);
    notFound();
  }

  let messages;
  try {
    // When i18n.ts is at the root, and messages are in src/messages/
    // the path for dynamic import should be relative to the project root.
    console.log(`[i18n.ts - ROOT] Attempting to import messages for locale "${locale}" from "./src/messages/${locale}.json"`);
    messages = (await import(`./src/messages/${locale}.json`)).default;
    console.log(`[i18n.ts - ROOT] Successfully imported messages for locale "${locale}"`);
  } catch (error) {
    console.error(`[i18n.ts - ROOT] FAILED to load messages for locale "${locale}" from "./src/messages/${locale}.json". Error:`, error);
    // Log the error and trigger a 404 page
    notFound();
  }

  return {
    messages
  };
});
