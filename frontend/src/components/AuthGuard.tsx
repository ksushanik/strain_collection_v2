'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { routing } from '@/i18n/routing';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const isLoginPage = pathname?.endsWith('/login');
    const localeMatch = pathname?.match(/^\/(ru|en)(\/|$)/);
    const locale = (localeMatch?.[1] as (typeof routing.locales)[number]) || routing.defaultLocale;

    useEffect(() => {
        if (!isLoading && !isAuthenticated && !isLoginPage) {
            const target = `/${locale}/login?from=${encodeURIComponent(pathname || '/')}`;
            router.push(target);
        }
    }, [isLoading, isAuthenticated, router, pathname, isLoginPage, locale]);

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!isAuthenticated && !isLoginPage) {
        return null; // Or a loading spinner while redirecting
    }

    return <>{children}</>;
}
