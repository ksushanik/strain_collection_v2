"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { ApiService, UiBinding } from "@/services/api"
import { StrainList } from "@/components/domain/strain-list"
import { SampleList } from "@/components/domain/sample-list"
import { StorageView } from "@/components/domain/storage-view"
import { useTranslations } from "next-intl"
import { translateDynamic } from "@/lib/translate-dynamic"

export default function DynamicPage() {
    const params = useParams()
    const slug = params?.slug as string
    const t = useTranslations('Common')
    const tDynamic = useTranslations('DynamicPages')

    const [binding, setBinding] = React.useState<UiBinding | null>(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        setLoading(true)
        ApiService.getUiBindings().then(bindings => {
            const found = bindings.find(b => b.routeSlug === slug)
            setBinding(found || null)
            setLoading(false)
        }).catch(err => {
            console.error('Failed to load bindings:', err)
            setLoading(false)
        })
    }, [slug])

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!binding) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold">{t('pageNotFound')}</h1>
                <p className="text-muted-foreground">{t('pageNotFoundDescription')}</p>
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{translateDynamic(tDynamic, binding.translationKey, binding.menuLabel)}</h1>
                    <p className="text-muted-foreground">
                        {t('profile')}: <span className="font-mono text-xs bg-muted px-1 rounded">{binding.profileKey}</span>
                    </p>
                </div>
            </div>

            {/* Dynamic Component Rendering - Note: profileKey is uppercase now */}
            {binding.profileKey === 'STRAIN' && (
                <StrainList enabledPacks={binding.enabledFieldPacks} returnPath={`/dynamic/${slug}`} />
            )}
            {binding.profileKey === 'SAMPLE' && <SampleList />}
            {binding.profileKey === 'STORAGE' && <StorageView legendText={binding.legend?.content} />}
        </div>
    )
}
