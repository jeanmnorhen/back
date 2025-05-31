// src/app/layout.tsx

// Este é o layout raiz absoluto.
// Ele precisa fornecer as tags <html> e <body>.
// O layout específico do locale em src/app/[locale]/layout.tsx
// irá então preencher essas tags com conteúdo e atributos específicos do locale.

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({children}: Props) {
  return (
    // O atributo lang e as classes de fonte podem ser definidos aqui como um fallback,
    // mas o src/app/[locale]/layout.tsx irá substituí-los ou complementá-los
    // para rotas internacionalizadas.
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}
