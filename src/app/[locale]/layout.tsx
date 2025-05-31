// src/app/[locale]/layout.tsx (ULTRA_HARDCODED_MINIMAL)
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
// import { GeistSans } from 'geist/font/sans'; // Removed for minimal test
// import { GeistMono } from 'geist/font/mono'; // Removed for minimal test
import '../globals.css';
// import { Toaster } from '@/components/ui/toaster'; // Removed for minimal test
// import { AuthProvider } from '@/contexts/AuthContext'; // Removed for minimal test

console.log(`[LocaleLayout - ULTRA_HARDCODED_MINIMAL] TOP LEVEL: File imported/evaluated. Timestamp:`, new Date().toISOString());

// No generateStaticParams for this minimal test
// export function generateStaticParams() {
//   console.log(`[LocaleLayout - ULTRA_HARDCODED_MINIMAL] generateStaticParams called.`);
//   return [{locale: 'en'}, {locale: 'pt'}];
// }

// No generateMetadata for this minimal test
// export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
//   // ... metadata generation logic ...
// }

export default async function LocaleLayout({
  children,
  params: {locale}
}: Readonly<{
  children: ReactNode;
  params: {locale: string};
}>) {
  unstable_setRequestLocale(locale);
  console.log(`[LocaleLayout - ULTRA_HARDCODED_MINIMAL] Rendering for locale: "${locale}". unstable_setRequestLocale called. Timestamp:`, new Date().toISOString());

  let messages;
  try {
    console.log(`[LocaleLayout - ULTRA_HARDCODED_MINIMAL] Attempting to get messages for locale: ${locale}.`);
    messages = await getMessages(); // No argument, rely on unstable_setRequestLocale
    console.log(`[LocaleLayout - ULTRA_HARDCODED_MINIMAL] Successfully got messages for locale: ${locale}. Message keys: ${Object.keys(messages || {}).join(', ')}`);
  } catch (error: any) {
    const errorMessage = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.error(`[LocaleLayout - ULTRA_HARDCODED_MINIMAL] CRITICAL ERROR calling getMessages() for locale ${locale}. Error: ${errorMessage}. Stack: ${error.stack ? error.stack.substring(0, 500) + '...' : 'No stack'}`);
    messages = { MinimalPage: { title: `Error loading messages for ${locale} (fallback)` } };
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
