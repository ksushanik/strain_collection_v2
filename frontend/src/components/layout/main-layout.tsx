import { Sidebar } from "@/components/layout/sidebar"
import { AuthGuard } from "@/components/AuthGuard"

export function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <div className="flex h-screen w-full overflow-hidden bg-background">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </AuthGuard>
    )
}
