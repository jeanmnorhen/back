
// src/i18n.ts
console.log('[i18n.ts] File imported/evaluated by Node/Next.js. Timestamp:', new Date().toISOString());

import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// Can be imported from a shared config
const locales = ['en', 'pt'];

export default getRequestConfig(async ({locale}) => {
  console.log(`[i18n.ts] getRequestConfig called for locale: "${locale}". Timestamp:`, new Date().toISOString());

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    console.error(`[i18n.ts] Invalid locale received in getRequestConfig: "${locale}". Supported: ${locales.join(', ')}. Calling notFound(). Timestamp:`, new Date().toISOString());
    notFound();
  }

  try {
    console.log(`[i18n.ts] Attempting to load messages for locale: "${locale}" from "./messages/${locale}.json". Timestamp:`, new Date().toISOString());
    const messages = (await import(`./messages/${locale}.json`)).default;
    console.log(`[i18n.ts] Successfully loaded messages for locale: "${locale}". Timestamp:`, new Date().toISOString());
    return {
      messages
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack available.';
    console.error(`[i18n.ts] CRITICAL ERROR during \`import('./messages/${locale}.json')\`. Locale: "${locale}". Error: ${errorMessage}. Stack: ${errorStack}. Timestamp:`, new Date().toISOString());
    // This error will be logged on the server.
    // For the client/Next.js error overlay, re-throwing a new error with more context can be helpful.
    throw new Error(
      `[i18n.ts] Failed to load messages for locale "${locale}". Check server logs for details. Original error: ${errorMessage}`
    );
  }
});

