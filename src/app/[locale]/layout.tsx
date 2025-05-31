// src/app/[locale]/layout.tsx (ABSOLUTE MINIMAL i18n TEST)
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import '../globals.css';

console.log(`[LocaleLayout - ABSOLUTE_MINIMAL_TEST] TOP LEVEL: File imported/evaluated. Timestamp:`, new Date().toISOString());

export default async function LocaleLayout({
  children,
  params: {locale}
}: Readonly<{
  children: ReactNode;
  params: {locale: string};
}>) {
  console.log(`[LocaleLayout - ABSOLUTE_MINIMAL_TEST] Locale: ${locale}. Attempting to get messages.`);
  
  let messages;
  try {
    messages = await getMessages();
    console.log(`[LocaleLayout - ABSOLUTE_MINIMAL_TEST] Successfully got messages for locale: ${locale}. Keys: ${messages ? Object.keys(messages).length : '0'}.`);
  } catch (error) {
    console.error(`[LocaleLayout - ABSOLUTE_MINIMAL_TEST] CRITICAL ERROR calling getMessages() for locale ${locale}:`, error);
    // Re-throwing the error so Next.js can handle it and show an error page.
    // This is important because if messages are not available, the app can't render correctly.
    throw error; 
  }

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
