"use client"

import * as React from "react"

import { SampleForm } from "@/components/domain/sample-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiService, Sample } from "@/services/api"
import { Loader2 } from "lucide-react"
import { PhotoUpload } from "@/components/domain/photo-upload"
import { useAuth } from "@/contexts/AuthContext"
import { useTranslations } from "next-intl"
import { hasPermission } from "@/lib/permissions"
import { AccessDenied } from "@/components/common/access-denied"

export default function EditSamplePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
    const { id } = React.use(params)
    const [sample, setSample] = React.useState<Sample | null>(null)
    const [loading, setLoading] = React.useState(true)
    const { user, isLoading: authLoading } = useAuth()
    const t = useTranslations('Samples')
    const canUpdateSample = hasPermission(user, "Sample", "update")
    const canManageSamplePhotos =
        hasPermission(user, "Photo", "create") ||
        hasPermission(user, "Photo", "delete")

    React.useEffect(() => {
        if (authLoading || !canUpdateSample) {
            setLoading(false)
            return
        }
        ApiService.getSample(parseInt(id))
            .then(setSample)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [authLoading, canUpdateSample, id])

    if (authLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!canUpdateSample) {
        return <AccessDenied />
    }

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!sample) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                {t('sampleNotFound')}
            </div>
        )
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">{t('editSample')}</h1>
                <p className="text-muted-foreground">
                    {t('editSampleSubtitle')}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('sampleDetails')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <SampleForm initialData={sample} isEdit />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('samplePhotos')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <PhotoUpload
                        sampleId={sample.id}
                        existingPhotos={sample.photos || []}
                        readOnly={!canManageSamplePhotos}
                        onPhotosChange={
                            canManageSamplePhotos
                                ? () => ApiService.getSample(sample.id).then(setSample).catch(console.error)
                                : undefined
                        }
                    />
                </CardContent>
            </Card>
        </div>
    )
}
