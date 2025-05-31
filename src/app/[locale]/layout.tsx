// src/app/[locale]/layout.tsx (ULTRA MINIMAL i18n TEST - DYNAMIC JSON)
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import '../globals.css'; // Keep globals for basic styling
// import { AuthProvider } from '@/contexts/AuthContext'; // Temporarily removed for i18n focus
// import { Toaster } from "@/components/ui/toaster"; // Temporarily removed

console.log(`[LocaleLayout - ULTRA_MINIMAL_DYNAMIC_JSON_TEST] TOP LEVEL: File imported/evaluated. Timestamp:`, new Date().toISOString());

// No generateStaticParams for this minimal test to ensure dynamic rendering initially

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
    console.log(`[LocaleLayout - ULTRA_MINIMAL_DYNAMIC_JSON_TEST] Attempting to get messages for locale: ${locale}`);
    messages = await getMessages();
    console.log(`[LocaleLayout - ULTRA_MINIMAL_DYNAMIC_JSON_TEST] Successfully got messages for locale: ${locale}. Message keys: ${Object.keys(messages || {}).join(', ')}`);
  } catch (error) {
    console.error(`[LocaleLayout - ULTRA_MINIMAL_DYNAMIC_JSON_TEST] CRITICAL ERROR calling getMessages() for locale ${locale}:`, error);
    // Re-throwing the error so Next.js can handle it and show an error page.
    // This is important because if messages are not available, the app can't render correctly.
    throw error; 
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* <AuthProvider> */} {/* Temporarily removed */}
            {children}
            {/* <Toaster /> */} {/* Temporarily removed */}
          {/* </AuthProvider> */}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

// No generateMetadata for this minimal test
