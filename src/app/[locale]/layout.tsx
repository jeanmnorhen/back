// src/app/[locale]/layout.tsx (ULTRA MINIMAL TEST)
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import '../globals.css'; // Keep globals for basic styling if needed

console.log(`[LocaleLayout - ULTRA_MINIMAL] TOP LEVEL: File imported/evaluated. Timestamp:`, new Date().toISOString());

export default async function LocaleLayout({
  children,
  params: {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
  console.log(`[LocaleLayout - ULTRA_MINIMAL] Attempting to get messages for locale: ${locale}. Timestamp:`, new Date().toISOString());
  
  let messages;
  try {
    messages = await getMessages();
    console.log(`[LocaleLayout - ULTRA_MINIMAL] Successfully got messages for locale: ${locale}. Keys: ${messages ? Object.keys(messages).join(', ') : 'null/undefined'}. Timestamp:`, new Date().toISOString());
  } catch (error) {
    console.error(`[LocaleLayout - ULTRA_MINIMAL] CRITICAL ERROR calling getMessages() for locale ${locale}:`, error);
    // Re-throw or handle, but for debugging, logging is key.
    // If we re-throw, Next.js will show its error page.
    // If we don't, the page might render partially or with missing translations.
    // For now, let it throw to see the Next.js error page if it's still the config error.
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
