// i18n.ts (AT PROJECT ROOT - ULTRA_HARDCODED_MINIMAL)
import {getRequestConfig} from 'next-intl/server';

const locales = ['en', 'pt'];

console.log(`[i18n.ts - ROOT - ULTRA_HARDCODED_MINIMAL] TOP LEVEL: File imported/evaluated. Timestamp:`, new Date().toISOString());

export default getRequestConfig(async ({locale}) => {
  console.log(`[i18n.ts - ROOT - ULTRA_HARDCODED_MINIMAL] getRequestConfig CALLED for locale: "${locale}". Timestamp:`, new Date().toISOString());

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    console.error(`[i18n.ts - ROOT - ULTRA_HARDCODED_MINIMAL] Invalid locale: "${locale}". Returning empty messages.`);
    return {messages: {}}; // Or throw an error, but let's keep it simple for now
  }

  // Using hardcoded messages for this minimal test
  const messages =
    locale === 'en'
      ? {MinimalPage: {title: 'Minimal English Title (Hardcoded)', greeting: 'Hello (Hardcoded EN)!'}}
      : {MinimalPage: {title: 'Título Mínimo em Português (Hardcoded)', greeting: 'Olá (Hardcoded PT)!'}};
  
  console.log(`[i18n.ts - ROOT - ULTRA_HARDCODED_MINIMAL] Successfully generated hardcoded messages for locale "${locale}". Keys: ${Object.keys(messages || {}).join(', ')}`);
  
  return {
    messages
  };
});