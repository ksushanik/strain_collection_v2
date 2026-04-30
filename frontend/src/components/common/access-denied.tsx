"use client"

import { Link } from "@/i18n/routing"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

export function AccessDenied() {
  const t = useTranslations("Common")
  const tNav = useTranslations("Navigation")
  const { hasToken } = useAuth()

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-2xl font-semibold">{t("accessDeniedTitle")}</h1>
        <p className="text-muted-foreground">
          {t("accessDeniedDescription")}
        </p>
        <div className="flex flex-col justify-center gap-2 sm:flex-row">
          <Button asChild variant="outline">
            <Link href="/">{tNav("dashboard")}</Link>
          </Button>
          {!hasToken ? (
            <Button asChild>
              <Link href="/login">{t("login")}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
