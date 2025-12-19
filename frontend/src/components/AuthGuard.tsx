'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { routing } from '@/i18n/routing';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname() || '/';
    const localeMatch = pathname.match(/^\/(ru|en)(\/|$)/);
    const locale = (localeMatch?.[1] as (typeof routing.locales)[number]) || routing.defaultLocale;
    const pathWithoutLocale = pathname.replace(/^\/(ru|en)/, '') || '/';
    const isLoginPage = pathWithoutLocale === '/login' || pathname.endsWith('/login');

    useEffect(() => {
        if (!isLoading && isAuthenticated && isLoginPage) {
            router.replace(`/${locale}`);
        }
    }, [isLoading, isAuthenticated, isLoginPage, locale, router]);

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return <>{children}</>;
}
