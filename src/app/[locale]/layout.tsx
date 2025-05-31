// src/app/[locale]/layout.tsx (MINIMAL TEST - REMOVED TRY-CATCH)
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import '../globals.css';
import { Toaster } from "@/components/ui/toaster";
// AuthProvider, generateMetadata, generateStaticParams are TEMPORARILY REMOVED for this minimal test

console.log(`[LocaleLayout - MINIMAL_TEST_NO_TRY_CATCH] TOP LEVEL: File imported/evaluated. Timestamp:`, new Date().toISOString());

export default async function LocaleLayout({
  children,
  params: {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
  // Log before calling getMessages
  console.log(`[LocaleLayout - MINIMAL_TEST_NO_TRY_CATCH] Attempting to get messages for locale: ${locale}. Timestamp:`, new Date().toISOString());
  
  // Directly call getMessages without a try-catch.
  // If this function is the source of the "Couldn't find config file" error,
  // its original stack trace should now be more prominent.
  const messages = await getMessages();
  
  console.log(`[LocaleLayout - MINIMAL_TEST_NO_TRY_CATCH] Successfully got messages for locale: ${locale}. Message keys: ${Object.keys(messages || {}).join(', ')}. Timestamp:`, new Date().toISOString());

  return (
    <html lang={locale} className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
