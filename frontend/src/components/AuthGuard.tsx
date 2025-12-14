'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { routing } from '@/i18n/routing';

const PUBLIC_PATHS = ['/', '/strains', '/samples', '/media', '/methods', '/legend', '/docs', '/storage', '/dynamic/storage'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname() || '/';
    const localeMatch = pathname.match(/^\/(ru|en)(\/|$)/);
    const locale = (localeMatch?.[1] as (typeof routing.locales)[number]) || routing.defaultLocale;
    const pathWithoutLocale = pathname.replace(/^\/(ru|en)/, '') || '/';
    const isLoginPage = pathWithoutLocale === '/login' || pathname.endsWith('/login');

    const isPublic = PUBLIC_PATHS.some((p) =>
        pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`),
    );

    useEffect(() => {
        if (!isLoading && isAuthenticated && isLoginPage) {
            router.replace(`/${locale}`);
        }
        if (!isLoading && !isAuthenticated && !isLoginPage && !isPublic) {
            const target = `/${locale}/login?from=${encodeURIComponent(pathname)}`;
            router.push(target);
        }
    }, [isLoading, isAuthenticated, isLoginPage, isPublic, locale, pathname, router]);

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!isAuthenticated && !isPublic && !isLoginPage) {
        return null; // ожидаем редирект
    }

    return <>{children}</>;
}
