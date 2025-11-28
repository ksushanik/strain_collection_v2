"use client"

import { usePathname } from "@/i18n/routing"
import { Sidebar } from "@/components/layout/sidebar"
import { AuthGuard } from "@/components/AuthGuard"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

export function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isLoginPage = pathname === '/login'

    return (
        <AuthGuard>
            {isLoginPage ? (
                children
            ) : (
                <div className="flex h-screen w-full overflow-hidden bg-background">
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto bg-muted/10">
                        <div className="flex justify-end p-4">
                            <LanguageSwitcher />
                        </div>
                        <div className="mx-auto w-full max-w-6xl px-6 pb-8">
                            {children}
                        </div>
                    </main>
                </div>
            )}
        </AuthGuard>
    )
}
