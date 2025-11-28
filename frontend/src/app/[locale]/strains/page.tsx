"use client"

import { StrainList } from "@/components/domain/strain-list"
import { useTranslations } from "next-intl"

export default function StrainsPage() {
    const t = useTranslations('Strains')

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">{t('pageTitle')}</h1>
                <p className="text-muted-foreground">
                    {t('pageDescription')}
                </p>
            </div>
            <StrainList enabledPacks={["taxonomy", "growth_characteristics"]} />
        </div>
    )
}
