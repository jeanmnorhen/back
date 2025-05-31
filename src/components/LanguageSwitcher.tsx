
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations('LanguageSwitcher');

  const handleChange = (newLocale: string) => {
    let baseNewPathname;

    // Check if the current pathname starts with the current locale prefix
    if (pathname.startsWith(`/${locale}/`)) {
      // e.g., /en/some-page -> /pt/some-page
      baseNewPathname = pathname.replace(`/${locale}/`, `/${newLocale}/`);
    } else if (pathname === `/${locale}`) {
      // e.g., /en (homepage) -> /pt
      baseNewPathname = `/${newLocale}`;
    } else {
      // Pathname does not start with the current locale prefix.
      // This typically means it's the default locale and the prefix might be omitted,
      // or the pathname is simply '/' for the default locale.
      if (pathname === '/') {
        baseNewPathname = `/${newLocale}`;
      } else {
        // e.g., locale='pt' (default), pathname='/about' -> /en/about
        baseNewPathname = `/${newLocale}${pathname}`;
      }
    }

    const currentQuery = searchParams.toString();
    const finalPath = currentQuery ? `${baseNewPathname}?${currentQuery}` : baseNewPathname;

    router.replace(finalPath);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-5 w-5 text-muted-foreground" />
      <Select value={locale} onValueChange={handleChange}>
        <SelectTrigger className="w-auto min-w-[150px] text-sm h-9">
          <SelectValue placeholder={t('selectLanguage')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{t('english')}</SelectItem>
          <SelectItem value="pt">{t('portuguese')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
