
import { NextResponse, type NextRequest } from 'next/server';

// Lista de locales suportados
const locales = ['en', 'pt'];
const defaultLocale = 'pt';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verifica se o pathname já possui um prefixo de locale suportado
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Se não tiver prefixo, redireciona para o locale padrão
  // Ex: /products -> /pt/products
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Matcher para executar o middleware em todas as rotas, exceto nas específicas da API, Next.js e arquivos estáticos.
  matcher: [
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|.*\\..*).*)'
  ]
};
