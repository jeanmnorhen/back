// src/app/[locale]/page.tsx (ULTRA_HARDCODED_MINIMAL)
'use client';

import { useTranslations } from 'next-intl';

console.log('[MinimalLocalePage - ULTRA_HARDCODED_MINIMAL] Rendering component...');

export default function MinimalLocalePage() {
  const t = useTranslations('MinimalPage');
  let title = "Default Title";
  let greeting = "Default Greeting";

  try {
    title = t('title');
    greeting = t('greeting');
    console.log(`[MinimalLocalePage - ULTRA_HARDCODED_MINIMAL] Translations loaded: title='${title}', greeting='${greeting}'`);
  } catch (e: any) {
    console.error(`[MinimalLocalePage - ULTRA_HARDCODED_MINIMAL] Error using translations: ${e.message}`);
    title = `Error: ${e.message}`;
    greeting = "Could not load translations.";
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>{title}</h1>
      <p>{greeting}</p>
      <p>Current locale (rendered client-side): {typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'unknown' : 'server'}</p>
    </div>
  );
}
