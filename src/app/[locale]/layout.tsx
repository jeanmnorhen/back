
import type {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations} from 'next-intl/server';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import '../globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';

// Função para gerar metadados dinamicamente
export async function generateMetadata({params: {locale}}: {params: {locale: string}}): Promise<Metadata> {
  try {
    console.log(`[LocaleLayout - generateMetadata] Attempting to getTranslations for locale: ${locale}`);
    const t = await getTranslations({locale, namespace: 'Layout'});
    console.log(`[LocaleLayout - generateMetadata] Successfully got translations for locale: ${locale}`);
    return {
      title: t('title'),
      description: t('description'),
    };
  } catch (error) {
    console.error(`[LocaleLayout - generateMetadata] CRITICAL ERROR calling getTranslations() for locale ${locale}:`, error);
    // Fallback metadata
    return {
      title: "Real Price (Error)",
      description: "Error loading translations.",
    };
  }
}

// Temporarily comment out generateStaticParams to test dynamic rendering
// export function generateStaticParams() {
//   const locales = ['en', 'pt'];
//   console.log('[LocaleLayout - generateStaticParams] CALLED, returning:', locales.map((locale) => ({locale})));
//   return locales.map((locale) => ({locale}));
// }

export default async function LocaleLayout({
  children,
  params: {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
  let messages;
  try {
    console.log(`[LocaleLayout - DefaultExport] Attempting to get messages for locale: ${locale}`);
    messages = await getMessages();
    console.log(`[LocaleLayout - DefaultExport] Successfully got messages for locale: ${locale}`);
  } catch (error) {
    console.error(`[LocaleLayout - DefaultExport] CRITICAL ERROR calling getMessages() for locale ${locale}:`, error);
    // Fallback or re-throw, depending on how you want to handle it.
    // Providing an empty object or basic messages might allow rendering but hide the root cause.
    // messages = { Layout: { title: "Error" }}; // Example fallback
    throw error; // Re-throw to see the original error from getMessages()
  }

  return (
    <html lang={locale} className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased">
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
