"use client"

import { StorageView } from "@/components/domain/storage-view"
import { useTranslations } from "next-intl"

export default function StoragePage() {
    const t = useTranslations('Navigation')

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">{t('storage')}</h1>
            </div>
            <StorageView />
        </div>
    )
}
