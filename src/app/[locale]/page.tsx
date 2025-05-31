'use client';

import {useTranslations} from 'next-intl';

export default function MinimalLocalePage() {
  const t = useTranslations('MinimalPage');

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>{t('title')}</h1>
      <p>{t('greeting')}</p>
      <p>Current Locale: {useTranslations()('Locale') === 'pt' ? 'Português' : 'English (or other)'}</p>
      <p>Testing another key (expect fallback or error if not defined): {t('nonExistentKey', {defaultValue: 'Fallback for nonExistentKey'})}</p>
    </div>
  );
}
