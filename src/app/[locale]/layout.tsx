
// src/app/[locale]/layout.tsx (REMOVED next-intl)
import type { ReactNode } from 'react';
// import { GeistSans } from 'geist/font/sans'; // Temporarily removed
// import { GeistMono } from 'geist/font/mono'; // Temporarily removed
import '../globals.css';
// import { Toaster } from '@/components/ui/toaster'; // Temporarily removed
// import { AuthProvider } from '@/contexts/AuthContext'; // Temporarily removed

console.log(`[LocaleLayout - NO_INTL_TEST] TOP LEVEL: File imported/evaluated. Timestamp:`, new Date().toISOString());


export default async function LocaleLayout({
  children,
  params: {locale}
}: Readonly<{
  children: ReactNode;
  params: {locale: string};
}>) {
  // unstable_setRequestLocale(locale); // Removed: next-intl specific
  console.log(`[LocaleLayout - NO_INTL_TEST] Rendering for locale: "${locale}". Timestamp:`, new Date().toISOString());

  // let messages; // Removed: next-intl specific
  // try {
  //   console.log(`[LocaleLayout - NO_INTL_TEST] Attempting to get messages for locale: ${locale}.`);
  //   messages = await getMessages({locale});
  //   console.log(`[LocaleLayout - NO_INTL_TEST] Successfully got messages for locale: ${locale}. Message keys: ${Object.keys(messages || {}).join(', ')}`);
  // } catch (error: any) {
  //   const errorMessage = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  //   console.error(`[LocaleLayout - NO_INTL_TEST] CRITICAL ERROR calling getMessages() for locale ${locale}. Error: ${errorMessage}. Stack: ${error.stack ? error.stack.substring(0, 500) + '...' : 'No stack'}`);
  //   // messages = { MinimalPage: { title: `Error loading messages for ${locale} (fallback)` } }; // Fallback not needed if provider is removed
  // }

  return (
    // <html lang={locale} className={`${GeistSans.variable} ${GeistMono.variable}`}>
    <html lang={locale}>
      <body>
        {/* <AuthProvider> */}
          {/* <NextIntlClientProvider locale={locale} messages={messages}> */}
            {children}
          {/* </NextIntlClientProvider> */}
          {/* <Toaster /> */}
        {/* </AuthProvider> */}
      </body>
    </html>
  );
}

