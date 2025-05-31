// src/app/[locale]/page.tsx (ULTRA MINIMAL i18n TEST - DYNAMIC JSON)
'use client';

import {useTranslations} from 'next-intl';

console.log('[MinimalLocalePage - DYNAMIC_JSON_FINAL_ATTEMPT] Rendering component...');

export default function MinimalLocalePage() {
  const t = useTranslations('MinimalPage');
  const tLayout = useTranslations('Layout'); 

  console.log('[MinimalLocalePage - DYNAMIC_JSON_FINAL_ATTEMPT] Rendering with translations...');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('greeting')}</p>
      <hr />
      <p>Layout Title from messages (via useTranslations in page): {tLayout('title')}</p>
      <p>Current locale (from useTranslations): {useTranslations()('Locale')}.</p>
    </div>
  );
}
