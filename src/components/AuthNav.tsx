
'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { LogIn, LogOut, UserPlus, Store, UserCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

interface AuthNavProps {
  isDropdownItem?: boolean; // To style as DropdownMenuItem if true
}

export default function AuthNav({ isDropdownItem = false }: AuthNavProps) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const tAuth = useTranslations('Auth');
  const tAppLayout = useTranslations('AppLayout');


  if (loading) {
    if (isDropdownItem) {
      return <DropdownMenuItem disabled>{tAuth('loginButton')}...</DropdownMenuItem>;
    }
    return <Button variant="ghost" disabled>{tAuth('loginButton')}...</Button>;
  }

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}`); // Redirect to home after logout
  };

  if (user) {
    if (isDropdownItem) {
      return (
        <>
          <DropdownMenuItem onClick={() => router.push(`/${locale}/profile/store`)}>
            <Store className="mr-2 h-4 w-4" />
            <span>{tAuth('myStore')}</span>
          </DropdownMenuItem>
          {/* Placeholder for user profile link, can be added later */}
          {/* <DropdownMenuItem onClick={() => router.push(`/${locale}/profile/user`)}>
            <UserCircle className="mr-2 h-4 w-4" />
            <span>{tAuth('profile')}</span>
          </DropdownMenuItem> */}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{tAuth('logoutButton')}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            {user.email}
          </div>
        </>
      );
    }
    // Non-dropdown version (simple button for header, if needed elsewhere)
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="mr-0 sm:mr-2 h-4 w-4" />
          <span className="hidden sm:inline">{tAuth('logoutButton')}</span>
        </Button>
      </div>
    );
  }

  // User not logged in
  if (isDropdownItem) {
    return (
      <>
        <DropdownMenuItem onClick={() => router.push(`/${locale}/login`)}>
          <LogIn className="mr-2 h-4 w-4" />
          <span>{tAuth('loginTitle')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/${locale}/signup`)}>
          <UserPlus className="mr-2 h-4 w-4" />
          <span>{tAuth('signUpTitle')}</span>
        </DropdownMenuItem>
      </>
    );
  }

  // Non-dropdown version (buttons for header, if needed elsewhere)
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={() => router.push(`/${locale}/login`)}>
        {tAuth('loginTitle')}
      </Button>
      <Button variant="default" size="sm" onClick={() => router.push(`/${locale}/signup`)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
        {tAuth('signUpTitle')}
      </Button>
    </div>
  );
}
