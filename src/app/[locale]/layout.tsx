import type {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server'; // getTranslations removed for now
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import '../globals.css';
import { Toaster } from "@/components/ui/toaster";
// AuthProvider removed for minimal test

// generateMetadata and generateStaticParams are TEMPORARILY REMOVED for this minimal test
// to reduce variables affecting the i18n setup.

export default async function LocaleLayout({
  children,
  params: {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
  let messages;
  try {
    console.log(`[LocaleLayout - MINIMAL_TEST] Attempting to get messages for locale: ${locale}`);
    messages = await getMessages();
    console.log(`[LocaleLayout - MINIMAL_TEST] Successfully got messages for locale: ${locale}. Message keys: ${Object.keys(messages || {}).join(', ')}`);
  } catch (error) {
    console.error(`[LocaleLayout - MINIMAL_TEST] CRITICAL ERROR calling getMessages() for locale ${locale}:`, error);
    // Fallback messages to allow rendering something, but the error is the key.
    messages = { MinimalPage: { greeting: "Error loading messages.", title: "Error" }, Layout: { title: "Error", description: "Error"}};
    // Re-throwing might be better in some cases to see the original error stack clearly in Vercel.
    // throw error;
  }

  return (
    <html lang={locale} className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased">
        {/* AuthProvider removed for minimal test */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
