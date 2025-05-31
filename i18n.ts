
// i18n.ts (AT PROJECT ROOT)
// THIS IS THE INTENDED AND SOLE CONFIGURATION FILE FOR NEXT-INTL FOR THIS TEST.

console.log(`[i18n.ts - ROOT - CLEAN_SLATE_HARDCODED] TOP LEVEL: File imported/evaluated. Timestamp:`, new Date().toISOString());

import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

const locales = ['en', 'pt'];

export default getRequestConfig(async ({locale}) => {
  console.log(`[i18n.ts - ROOT - CLEAN_SLATE_HARDCODED] getRequestConfig CALLED for locale: "${locale}". Timestamp:`, new Date().toISOString());

  if (!locales.includes(locale as any)) {
    console.error(`[i18n.ts - ROOT - CLEAN_SLATE_HARDCODED] Invalid locale: "${locale}". Calling notFound().`);
    notFound();
  }

  let messages;
  if (locale === 'en') {
    messages = {
      Locale: "en",
      Layout: {
        title: "Real Price (EN - Hardcoded)",
        description: "Find local deals (EN - Hardcoded)."
      },
      ImageInsightExplorerPage: { // Keeping this structure for AppLayout
        title: "Real Price App (EN - Hardcoded)"
      },
      AppLayout: { // Keys used by AppLayout
        dealsTabTitle: "Deals",
        identifyTabTitle: "Identify",
        mapTabTitle: "Map",
        accountTabTitle: "Account",
        menuLabel: "Menu",
        searchPlaceholder: "Search products...",
        loadingDeals: "Loading deals..."
      },
      LanguageSwitcher: {
        selectLanguage: "Select Language",
        english: "English",
        portuguese": "Portuguese"
      }
    };
    console.log(`[i18n.ts - ROOT - CLEAN_SLATE_HARDCODED] Assigned EN messages for locale "${locale}"`);
  } else if (locale === 'pt') {
    messages = {
      Locale: "pt",
      Layout: {
        title: "Preço Real (PT - Hardcoded)",
        description: "Encontre ofertas locais (PT - Hardcoded)."
      },
      ImageInsightExplorerPage: {
        title: "App Preço Real (PT - Hardcoded)"
      },
      AppLayout: {
        dealsTabTitle: "Ofertas",
        identifyTabTitle: "Identificar",
        mapTabTitle: "Mapa",
        accountTabTitle: "Conta",
        menuLabel: "Menu",
        searchPlaceholder: "Buscar produtos...",
        loadingDeals: "Carregando ofertas..."
      },
      LanguageSwitcher: {
        selectLanguage: "Selecionar Idioma",
        english: "Inglês",
        portuguese": "Português"
      }
    };
    console.log(`[i18n.ts - ROOT - CLEAN_SLATE_HARDCODED] Assigned PT messages for locale "${locale}"`);
  } else {
    console.error(`[i18n.ts - ROOT - CLEAN_SLATE_HARDCODED] Unhandled locale: "${locale}". This should not happen.`);
    notFound();
  }

  console.log(`[i18n.ts - ROOT - CLEAN_SLATE_HARDCODED] Returning messages for locale "${locale}".`);
  return {
    messages
  };
});

    