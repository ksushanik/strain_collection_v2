"use client"

import { StorageView } from "@/components/domain/storage-view"
import { useTranslations } from "next-intl"

export default function StoragePage() {
    const t = useTranslations('Storage')

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">{t('pageTitle')}</h1>
                <p className="text-muted-foreground">{t('pageDescription')}</p>
            </div>
            <StorageView />
        </div>
    )
}
