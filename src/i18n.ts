
// src/i18n.ts
console.log(`[i18n.ts] TOP LEVEL: File imported/evaluated. Timestamp:`, new Date().toISOString());

import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// Can be imported from a shared config
const locales = ['en', 'pt'];

export default getRequestConfig(async ({locale}) => {
  console.log(`[i18n.ts] getRequestConfig CALLED for locale: "${locale}". Timestamp:`, new Date().toISOString());

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    console.error(`[i18n.ts] Invalid locale received in getRequestConfig: "${locale}". Supported: ${locales.join(', ')}. Calling notFound(). Timestamp:`, new Date().toISOString());
    notFound();
  }

  // Return hardcoded messages for testing
  if (locale === 'pt') {
    console.log('[i18n.ts] Returning HARDCODED messages for PT locale.');
    return {
      messages: {
        Locale: "pt",
        Layout: {
          title: "[TESTE PT] Preço Real - Ofertas Locais",
          description: "[TESTE PT] Encontre produtos e ofertas perto de você."
        },
        AppLayout: {
          dealsTabTitle: "Ofertas (PT)",
          identifyTabTitle: "Identificar (PT)",
          mapTabTitle: "Mapa (PT)",
          accountTabTitle: "Conta (PT)",
          mapFeatureComingSoon: "Mapa em breve! (PT)"
        }
        // Add a few more essential keys if your layout depends on them,
        // otherwise, this minimal set is fine for testing the config loading.
      }
    };
  } else if (locale === 'en') {
    console.log('[i18n.ts] Returning HARDCODED messages for EN locale.');
    return {
      messages: {
        Locale: "en",
        Layout: {
          title: "[TEST EN] Real Price - Local Deals",
          description: "[TEST EN] Find products and deals near you."
        },
        AppLayout: {
          dealsTabTitle: "Deals (EN)",
          identifyTabTitle: "Identify (EN)",
          mapTabTitle: "Map (EN)",
          accountTabTitle: "Account (EN)",
          mapFeatureComingSoon: "Map feature coming soon! (EN)"
        }
      }
    };
  }

  // Fallback for any other locale, though validation should catch this.
  console.error(`[i18n.ts] Locale "${locale}" was not 'en' or 'pt' after validation. This should not happen. Calling notFound().`);
  notFound();
});

