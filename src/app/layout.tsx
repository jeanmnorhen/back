// This file can be removed if not needed,
// as src/app/[locale]/layout.tsx will be the main layout.
// For now, we keep it minimal.
// It might be used for truly global things that are above locale context.
// However, next-intl typically handles <html> and <body> in the [locale]/layout.tsx.

type Props = {
  children: React.ReactNode;
};

// Since we are defining <html> and <body> in `src/app/[locale]/layout.tsx`,
// this layout can be very simple.
export default function RootLayout({children}: Props) {
  return children;
}
