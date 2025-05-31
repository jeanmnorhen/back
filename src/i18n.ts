
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

const locales = ['en', 'pt'];

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    console.error(`[i18n.ts] Invalid locale received: ${locale}. Supported locales: ${locales.join(', ')}`);
    notFound();
  }

  try {
    // console.log(`[i18n.ts] Attempting to load messages for locale: ${locale} from ./messages/${locale}.json`);
    const messages = (await import(`./messages/${locale}.json`)).default;
    // console.log(`[i18n.ts] Successfully loaded messages for locale: ${locale}`);
    return {
      messages
    };
  } catch (error) {
    console.error(`[i18n.ts] CRITICAL ERROR loading messages for locale "${locale}":`, error);
    // This error will be logged on the server.
    // For the client/Next.js error overlay, re-throwing a new error with more context can be helpful.
    throw new Error(`Failed to load messages for locale "${locale}". Check server logs. Original error: ${error instanceof Error ? error.message : String(error)}`);
  }
});

