// src/app/[locale]/page.tsx (ABSOLUTE MINIMAL i18n TEST)
'use client';

import {useTranslations} from 'next-intl';

export default function MinimalLocalePage() {
  const t = useTranslations('MinimalPage');
  const tLayout = useTranslations('Layout'); // Example of using another namespace

  console.log('[MinimalLocalePage] Rendering...');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('greeting')}</p>
      <hr />
      <p>Layout Title from messages: {tLayout('title')}</p>
    </div>
  );
}
