// src/app/[locale]/layout.tsx (ULTRA MINIMAL i18n TEST + unstable_setRequestLocale)
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import '../globals.css';

console.log(`[LocaleLayout - SET_REQUEST_LOCALE_TEST] TOP LEVEL: File imported/evaluated. Timestamp:`, new Date().toISOString());

export default async function LocaleLayout({
  children,
  params: {locale}
}: Readonly<{
  children: ReactNode;
  params: {locale: string};
}>) {
  // Ensure the locale is set for the current request
  unstable_setRequestLocale(locale);
  console.log(`[LocaleLayout - SET_REQUEST_LOCALE_TEST] Rendering for locale: "${locale}". unstable_setRequestLocale called. Timestamp:`, new Date().toISOString());

  let messages;
  try {
    console.log(`[LocaleLayout - SET_REQUEST_LOCALE_TEST] Attempting to get messages for locale: ${locale}.`);
    messages = await getMessages({locale}); // Explicitly pass locale
    console.log(`[LocaleLayout - SET_REQUEST_LOCALE_TEST] Successfully got messages for locale: ${locale}. Message keys: ${Object.keys(messages || {}).join(', ')}`);
  } catch (error: any) {
    const errorMessage = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.error(`[LocaleLayout - SET_REQUEST_LOCALE_TEST] CRITICAL ERROR calling getMessages({locale}) for locale ${locale}. Error: ${errorMessage}. Stack: ${error.stack ? error.stack.substring(0, 300) + '...' : 'No stack'}`);
    throw error;
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
