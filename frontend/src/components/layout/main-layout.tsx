"use client"

import * as React from "react"
import { usePathname } from "@/i18n/routing"
import { Sidebar } from "@/components/layout/sidebar"
import { AuthGuard } from "@/components/AuthGuard"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { Button } from "@/components/ui/button"
import { Menu, Microscope } from "lucide-react"
import { GlobalSearch } from "@/components/domain/global-search/global-search"
import { ThemeToggle } from "@/components/theme-toggle"

export function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isLoginPage = pathname === '/login' || pathname?.endsWith('/login')
    const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false)

    React.useEffect(() => {
        setIsMobileNavOpen(false)
    }, [pathname])

    return (
        <AuthGuard>
            {isLoginPage ? (
                children
            ) : (
                <div className="flex min-h-screen w-full bg-muted/30">
                    <div className="hidden md:block md:shrink-0 p-3 pr-0">
                        <div className="sticky top-0 h-screen">
                            <Sidebar />
                        </div>
                    </div>
                    <div className="flex min-h-screen flex-1 flex-col p-3 pl-0">
                        <div className="flex items-center justify-between border-b bg-card px-4 py-3 md:hidden">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => setIsMobileNavOpen(true)}>
                                    <Menu className="h-5 w-5" />
                                </Button>
                                <div className="flex items-center gap-1.5">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
                                        <Microscope className="h-3.5 w-3.5 text-primary-foreground" />
                                    </div>
                                    <span className="font-semibold text-sm">BioCollection</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <GlobalSearch trigger="icon" />
                                <ThemeToggle />
                                <LanguageSwitcher />
                            </div>
                        </div>
                        <div className="hidden items-center gap-3 bg-card px-4 py-3 md:flex rounded-t-xl border-b border-border/60">
                            <GlobalSearch />
                            <div className="ml-auto flex items-center gap-2">
                                <ThemeToggle />
                                <LanguageSwitcher />
                            </div>
                        </div>
                        <main className="flex-1 overflow-y-auto bg-card rounded-b-xl shadow-sm">
                            <div className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
                                {children}
                            </div>
                        </main>
                    </div>

                    {isMobileNavOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40 bg-black/40 md:hidden"
                                onClick={() => setIsMobileNavOpen(false)}
                            />
                            <div className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] md:hidden">
                                <Sidebar
                                    isMobile
                                    onNavigate={() => setIsMobileNavOpen(false)}
                                    className="h-full shadow-lg"
                                />
                            </div>
                        </>
                    )}
                </div>
            )}
        </AuthGuard>
    )
}
