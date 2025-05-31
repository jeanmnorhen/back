// src/app/[locale]/page.tsx (FINAL_ATTEMPT_DYNAMIC_JSON - Using AppLayout)
'use client';

import AppLayout from '@/components/AppLayout';
import {useTranslations} from 'next-intl'; // Keep for potential direct use if needed

console.log('[LocalePage - FINAL_ATTEMPT_DYNAMIC_JSON] Rendering component...');

export default function LocalePage() {
  // const t = useTranslations('MinimalPage'); // For direct use if AppLayout wasn't wrapping everything
  // const tLayout = useTranslations('Layout'); 

  console.log('[LocalePage - FINAL_ATTEMPT_DYNAMIC_JSON] Rendering with AppLayout...');

  return <AppLayout />;
}
