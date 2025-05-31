// src/app/[locale]/page.tsx (ULTRA MINIMAL i18n TEST - DYNAMIC JSON)
'use client';

import {useTranslations} from 'next-intl';
// import AppLayout from '@/components/AppLayout'; // Temporarily removed

console.log('[MinimalLocalePage - ULTRA_MINIMAL_DYNAMIC_JSON_TEST] Rendering component...');

export default function MinimalLocalePage() {
  const t = useTranslations('MinimalPage');
  const tLayout = useTranslations('Layout'); 

  console.log('[MinimalLocalePage - ULTRA_MINIMAL_DYNAMIC_JSON_TEST] Rendering with translations...');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('greeting')}</p>
      <hr />
      <p>Layout Title from messages: {tLayout('title')}</p>
      <p>This is a basic test page for {useTranslations()('Locale') === 'pt' ? 'Portuguese' : 'English'}.</p>
    </div>
  );
}