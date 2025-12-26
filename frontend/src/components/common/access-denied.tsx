"use client"

import { useTranslations } from "next-intl"

export function AccessDenied() {
  const t = useTranslations("Common")

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">{t("accessDeniedTitle")}</h1>
        <p className="text-muted-foreground">
          {t("accessDeniedDescription")}
        </p>
      </div>
    </div>
  )
}
