// src/app/[locale]/layout.tsx (ULTRA MINIMAL i18n TEST - DYNAMIC JSON)
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import '../globals.css';

console.log(`[LocaleLayout - ULTRA_MINIMAL_DYNAMIC_JSON_TEST] TOP LEVEL: File imported/evaluated. Timestamp:`, new Date().toISOString());

export default async function LocaleLayout({
  children,
  params: {locale}
}: Readonly<{
  children: ReactNode;
  params: {locale: string};
}>) {
  console.log(`[LocaleLayout - ULTRA_MINIMAL_DYNAMIC_JSON_TEST] Rendering for locale: "${locale}".`);

  let messages;
  try {
    console.log(`[LocaleLayout - ULTRA_MINIMAL_DYNAMIC_JSON_TEST] Attempting to get messages for locale: ${locale} using getMessages({locale})`);
    messages = await getMessages({locale}); // Explicitly pass locale
    console.log(`[LocaleLayout - ULTRA_MINIMAL_DYNAMIC_JSON_TEST] Successfully got messages for locale: ${locale}. Message keys: ${Object.keys(messages || {}).join(', ')}`);
  } catch (error) {
    console.error(`[LocaleLayout - ULTRA_MINIMAL_DYNAMIC_JSON_TEST] CRITICAL ERROR calling getMessages({locale}) for locale ${locale}:`, error);
    // Re-throwing the error so Next.js can handle it and show an error page.
    // This is important because if messages are not available, the app can't render correctly.
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
