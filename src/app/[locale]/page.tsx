// src/app/[locale]/page.tsx (ULTRA MINIMAL TEST)
'use client';

import {useTranslations} from 'next-intl';

export default function MinimalLocalePage() {
  const t = useTranslations('MinimalPage');
  const tLayout = useTranslations('Layout'); // To ensure Layout messages are pulled if needed

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('greeting')}</p>
      <p style={{ fontSize: '0.8em', color: 'gray', marginTop: '10px' }}>
        Layout Title (from Layout messages): {tLayout('title')}
      </p>
    </div>
  );
}
