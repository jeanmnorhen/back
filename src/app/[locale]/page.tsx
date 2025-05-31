
// src/app/[locale]/page.tsx (REMOVED next-intl)
'use client';

// import { useTranslations } from 'next-intl'; // Removed
// import AppLayout from '@/components/AppLayout'; // Temporarily removed to simplify

console.log('[LocalePage - NO_INTL_TEST] Rendering component...');

export default function LocalePage({ params }: { params: { locale: string } }) {
  // const t = useTranslations('ImageInsightExplorerPage'); // Removed

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Página Principal (Sem i18n)</h1>
      <p>Locale atual: {params.locale}</p>
      <p>Se você vê esta página, o roteamento básico e a renderização estão funcionando sem o next-intl.</p>
      {/* <AppLayout /> */}
    </div>
  );
}
