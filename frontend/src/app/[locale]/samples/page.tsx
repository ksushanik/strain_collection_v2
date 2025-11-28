"use client"

import { SampleList } from "@/components/domain/sample-list"
import { useTranslations } from "next-intl"

export default function SamplesPage() {
    const t = useTranslations('Samples')

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">{t('pageTitle')}</h1>
                <p className="text-muted-foreground">{t('pageDescription')}</p>
            </div>
            <SampleList />
        </div>
    )
}
