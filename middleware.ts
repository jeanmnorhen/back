import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'pt'],

  // Used when no locale matches
  defaultLocale: 'pt',
  localePrefix: 'as-needed'
});

export const config = {
  // Match only internationalized pathnames
  // Skip all paths that should not be internationalized. This example skips the
  // folders "api", "_next" and all files with an extension (e.g. favicon.ico)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)']
};
