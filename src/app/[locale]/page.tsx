'use client';

import { useTranslation } from 'react-i18next';
// import AppLayout from '@/components/AppLayout'; // AppLayout will be re-integrated later

export default function LocalePage({ params }: { params: { locale: string } }) {
  const { t, i18n } = useTranslation(); // Default namespace is 'translation'

  // Log current language from i18next instance to verify
  console.log('[LocalePage] Current i18next language:', i18n.language);
  console.log('[LocalePage] Params locale:', params.locale);

  if (!i18n.isInitialized) {
    return (
       <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
        <h1>Loading translations...</h1>
      </div>
    );
  }
  
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>{t('HomePage.welcome')}</h1>
      <p>{t('HomePage.tagline')}</p>
      <p>Current language detected by i18next: <strong>{i18n.language}</strong></p>
      <p>Locale from URL params: <strong>{params.locale}</strong></p>
      <hr style={{ margin: '20px 0' }} />
      {/* 
        AppLayout will be re-integrated in a subsequent step.
        It needs to be updated to use react-i18next's useTranslation hook.
        <AppLayout /> 
      */}
      <div style={{ marginTop: '20px', padding:'10px', border: '1px solid #ccc', backgroundColor: '#f9f9f9'}}>
        <p style={{fontWeight: 'bold'}}>Note:</p>
        <p>The main application layout (AppLayout with tabs) is temporarily removed from this page.</p>
        <p>It will be reintegrated once its internal texts are migrated to use <code>react-i18next</code>.</p>
      </div>
    </div>
  );
}
