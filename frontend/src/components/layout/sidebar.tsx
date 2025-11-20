"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    Microscope,
    Leaf,
    FlaskConical,
    Box,
    Settings,
    Menu,
    Loader2
} from "lucide-react"
import { ApiService, UiBinding } from "@/services/api"

// Map string icon names to components
const IconMap: Record<string, any> = {
    "LayoutDashboard": LayoutDashboard,
    "Microscope": Microscope,
    "Leaf": Leaf,
    "FlaskConical": FlaskConical,
    "Box": Box,
};

export function Sidebar() {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = React.useState(false)
    const [bindings, setBindings] = React.useState<UiBinding[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        ApiService.getUiBindings().then(data => {
            setBindings(data)
            setLoading(false)
        }).catch(err => {
            console.error('Failed to load UI bindings:', err)
            setLoading(false)
        })
    }, [])

    return (
        <div className={cn(
            "flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
            isCollapsed ? "w-16" : "w-64"
        )}>
            <div className="flex h-14 items-center border-b px-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="mr-2"
                >
                    <Menu className="h-4 w-4" />
                </Button>
                {!isCollapsed && <span className="font-semibold">BioCollection</span>}
            </div>

            <div className="flex-1 overflow-auto py-4">
                <nav className="grid gap-1 px-2">
                    <Link
                        href="/"
                        className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            pathname === "/" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground",
                            isCollapsed && "justify-center px-2"
                        )}
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        {!isCollapsed && <span>Dashboard</span>}
                    </Link>

                    {loading ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        bindings.map((item, index) => {
                            const Icon = IconMap[item.icon] || Box
                            const href = `/dynamic/${item.routeSlug}`
                            const isActive = pathname === href

                            return (
                                <Link
                                    key={index}
                                    href={href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground",
                                        isCollapsed && "justify-center px-2"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {!isCollapsed && <span>{item.menuLabel}</span>}
                                </Link>
                            )
                        })
                    )}
                </nav>
            </div>

            <div className="border-t p-4">
                <Link
                    href="/settings"
                    className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        pathname === "/settings" && "bg-sidebar-accent text-sidebar-accent-foreground",
                        isCollapsed && "justify-center px-2"
                    )}
                >
                    <Settings className="h-4 w-4" />
                    {!isCollapsed && <span>Settings</span>}
                </Link>
            </div>
        </div>
    )
}
