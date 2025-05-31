// src/app/[locale]/layout.tsx (FINAL_ATTEMPT_DYNAMIC_JSON)
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import '../globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';

console.log(`[LocaleLayout - FINAL_ATTEMPT_DYNAMIC_JSON] TOP LEVEL: File imported/evaluated. Timestamp:`, new Date().toISOString());

export function generateStaticParams() {
  console.log(`[LocaleLayout - FINAL_ATTEMPT_DYNAMIC_JSON] generateStaticParams called.`);
  return [{locale: 'en'}, {locale: 'pt'}];
}

export default async function LocaleLayout({
  children,
  params: {locale}
}: Readonly<{
  children: ReactNode;
  params: {locale: string};
}>) {
  unstable_setRequestLocale(locale);
  console.log(`[LocaleLayout - FINAL_ATTEMPT_DYNAMIC_JSON] Rendering for locale: "${locale}". unstable_setRequestLocale called. Timestamp:`, new Date().toISOString());

  let messages;
  try {
    console.log(`[LocaleLayout - FINAL_ATTEMPT_DYNAMIC_JSON] Attempting to get messages for locale: ${locale}.`);
    messages = await getMessages(); // Call without explicit locale, relying on unstable_setRequestLocale
    console.log(`[LocaleLayout - FINAL_ATTEMPT_DYNAMIC_JSON] Successfully got messages for locale: ${locale}. Message keys: ${Object.keys(messages || {}).join(', ')}`);
  } catch (error: any) {
    const errorMessage = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.error(`[LocaleLayout - FINAL_ATTEMPT_DYNAMIC_JSON] CRITICAL ERROR calling getMessages() for locale ${locale}. Error: ${errorMessage}. Stack: ${error.stack ? error.stack.substring(0, 500) + '...' : 'No stack'}`);
    // Forcing build to fail might be better if this path is hit, to make it obvious.
    // throw error; // Uncomment to make build fail hard on this error
    // Fallback to an empty object for messages if getMessages fails, to prevent provider from breaking
    messages = { MinimalPage: { title: `Error loading messages for ${locale}` } };
  }

  return (
    <html lang={locale} className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <AuthProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
            <Toaster />
          </NextIntlClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
