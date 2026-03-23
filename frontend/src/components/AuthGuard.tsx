'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname() || '/';
    const pathWithoutLocale = pathname.replace(/^\/(ru|en)/, '') || '/';
    const isLoginPage = pathWithoutLocale === '/login' || pathname.endsWith('/login');

    useEffect(() => {
        if (!isLoading && isAuthenticated && isLoginPage) {
            router.replace('/');
        }
        if (!isLoading && !isAuthenticated && !isLoginPage) {
            router.replace('/login');
        }
    }, [isLoading, isAuthenticated, isLoginPage, router]);

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return <>{children}</>;
}
