// src/app/[locale]/layout.tsx (ULTRA MINIMAL i18n TEST + unstable_setRequestLocale + DYNAMIC JSON)
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import '../globals.css';

console.log(`[LocaleLayout - DYNAMIC_JSON_FINAL_ATTEMPT] TOP LEVEL: File imported/evaluated. Timestamp:`, new Date().toISOString());

export default async function LocaleLayout({
  children,
  params: {locale}
}: Readonly<{
  children: ReactNode;
  params: {locale: string};
}>) {
  unstable_setRequestLocale(locale);
  console.log(`[LocaleLayout - DYNAMIC_JSON_FINAL_ATTEMPT] Rendering for locale: "${locale}". unstable_setRequestLocale called. Timestamp:`, new Date().toISOString());

  let messages;
  try {
    console.log(`[LocaleLayout - DYNAMIC_JSON_FINAL_ATTEMPT] Attempting to get messages for locale: ${locale}.`);
    messages = await getMessages(); // Call without explicit locale
    console.log(`[LocaleLayout - DYNAMIC_JSON_FINAL_ATTEMPT] Successfully got messages for locale: ${locale}. Message keys: ${Object.keys(messages || {}).join(', ')}`);
  } catch (error: any) {
    const errorMessage = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.error(`[LocaleLayout - DYNAMIC_JSON_FINAL_ATTEMPT] CRITICAL ERROR calling getMessages() for locale ${locale}. Error: ${errorMessage}. Stack: ${error.stack ? error.stack.substring(0, 500) + '...' : 'No stack'}`);
    // Forcing build to fail is better for debugging
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
