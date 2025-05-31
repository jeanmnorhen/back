import type { ReactNode } from 'react';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n'; // Import the client-side configured i18n instance
import I18nInitializer from '@/components/I18nInitializer';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import '../globals.css';

// Metadata generation will be simplified for now and won't use i18n directly in this phase
// We can add server-side i18n for metadata later if needed.
export async function generateMetadata({ params: { locale } }: { params: { locale: string }}) {
  const title = locale === 'pt' 
    ? "Preço Real (PT) - Sua Busca Local" 
    : "Real Price (EN) - Your Local Search";
  const description = locale === 'pt'
    ? "Encontre ofertas e produtos em lojas próximas."
    : "Find deals and products in nearby stores.";
  
  return {
    title,
    description,
  };
}

export default function LocaleLayout({
  children,
  params: { locale },
}: Readonly<{
  children: ReactNode;
  params: { locale: string };
}>) {
  console.log(`[LocaleLayout react-i18next] Rendering for locale: "${locale}". Timestamp:`, new Date().toISOString());

  return (
    <html lang={locale} className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <I18nextProvider i18n={i18n}>
          <I18nInitializer locale={locale} />
          <AuthProvider>
            <Toaster />
            {children}
          </AuthProvider>
        </I18nextProvider>
      </body>
    </html>
  );
}
