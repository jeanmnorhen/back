
'use client';

// Este componente de página agora usará AppLayout, que precisa do AuthContext.
// Apenas certifique-se de que AppLayout está corretamente importado e usado.
// Nenhuma mudança direta é necessária aqui se AppLayout já consome o AuthContext
// e este page.tsx está simplesmente renderizando AppLayout.

import AppLayout from '@/components/AppLayout';

export default function LocalePage() {
  // O AppLayout será renderizado aqui e terá acesso ao AuthContext
  // porque AuthProvider está no LocaleLayout acima dele.
  return <AppLayout />;
}

    