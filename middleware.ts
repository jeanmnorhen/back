import { NextResponse, type NextRequest } from 'next/server';

const locales = ['en', 'pt'];
const defaultLocale = 'pt';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the pathname already has a supported locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    // If the locale is already in the path, set a cookie for i18next-browser-languagedetector
    // This helps sync client-side detection if it relies on cookies.
    const detectedLocale = pathname.split('/')[1];
    if (locales.includes(detectedLocale)) {
      const response = NextResponse.next();
      response.cookies.set('i18next', detectedLocale, { path: '/' });
      return response;
    }
    return NextResponse.next();
  }

  // If no locale prefix, redirect to the default locale
  // Example: /products -> /pt/products
  // Example: / -> /pt
  const newPathname = `/${defaultLocale}${pathname.startsWith('/') ? '' : '/'}${pathname}`;
  const redirectUrl = new URL(newPathname, request.url);
  
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set('i18next', defaultLocale, { path: '/' }); // Set cookie for default locale
  return response;
}

export const config = {
  // Matcher to execute the middleware on all routes,
  // except for API routes, Next.js specific files, static files, and files in /public
  matcher: [
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|locales|.*\\..*).*)',
  ],
};
