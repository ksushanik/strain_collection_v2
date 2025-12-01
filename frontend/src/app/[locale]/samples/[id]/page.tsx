"use client"

import * as React from "react"
import dynamic from 'next/dynamic'
import { ApiService, Sample } from "@/services/api"

import { Loader2, ArrowLeft, MapPin, Calendar, Leaf, Microscope, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter, Link } from "@/i18n/routing"
import { PhotoUpload } from "@/components/domain/photo-upload"
import { useTranslations } from "next-intl"

// Dynamic import for map to avoid SSR issues
const SampleMap = dynamic(
    () => import('@/components/domain/sample-map').then(mod => mod.SampleMap),
    {
        ssr: false,
        loading: () => (
            <div className="h-64 bg-muted/30 rounded-md border flex items-center justify-center px-4 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }
)

interface SampleWithStrains extends Sample {
    strains: Array<{
        id: number;
        identifier: string;
        seq: boolean;
        gramStain: string;
    }>;
    photos: import('@/services/api').SamplePhoto[];
}

export default function SampleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = React.use(params)
    const t = useTranslations('Samples')
    const tCommon = useTranslations('Common')
    const tStrains = useTranslations('Strains')
    const [sample, setSample] = React.useState<SampleWithStrains | null>(null)
    const [loading, setLoading] = React.useState(true)

    const loadSample = React.useCallback(() => {
        if (!id) return;
        ApiService.getSample(parseInt(id))
            .then((data) => {
                setSample(data as SampleWithStrains)
                setLoading(false)
            })
            .catch(err => {
                console.error('Failed to load sample:', err)
                setLoading(false)
            })
    }, [id])

    React.useEffect(() => {
        loadSample()
    }, [loadSample])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!sample) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold">{t('sampleNotFound')}</h1>
                <Button variant="link" onClick={() => router.back()}>{tCommon('back')}</Button>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <Button variant="outline" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    {tCommon('back')}
                </Button>
                <Button variant="default" size="sm" onClick={() => router.push(`/samples/${sample.id}/edit`)}>
                    <Edit className="h-4 w-4 mr-1" />
                    {t('editSample')}
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{sample.code}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <Badge variant="outline">{t(sample.sampleType.toLowerCase())}</Badge>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(sample.collectedAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column: Info & Map */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Leaf className="h-5 w-5" />
                                {t('collectionSite')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-2">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">{sample.siteName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {tCommon('lat')}: {sample.lat}, {tCommon('lng')}: {sample.lng}
                                    </p>
                                </div>
                            </div>
                            {sample.description && (
                                <div className="pt-4 border-t">
                                    <span className="text-sm font-medium block mb-1">{tCommon('description')}:</span>
                                    <p className="text-muted-foreground">{sample.description}</p>
                                </div>
                            )}

                            {/* Map */}
                            {sample.lat && sample.lng ? (
                                <SampleMap
                                    lat={sample.lat}
                                    lng={sample.lng}
                                    siteName={sample.siteName}
                                    className="h-64"
                                />
                            ) : (
                                <div className="h-64 bg-muted/30 rounded-md border flex items-center justify-center px-4 text-center">
                                    <div className="text-center text-muted-foreground">
                                        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>{t('noCoordinates')}</p>
                                        <p className="text-xs">{t('addCoordinates')}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Photos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('samplePhotos')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PhotoUpload
                                sampleId={sample.id}
                                existingPhotos={sample.photos || []}
                                readOnly
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Strains */}
                <div className="space-y-6">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Microscope className="h-5 w-5" />
                                {t('isolatedStrains')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {sample.strains && sample.strains.length > 0 ? (
                                <div className="space-y-3">
                                    {sample.strains.map(strain => (
                                        <Link
                                            key={strain.id}
                                            href={`/strains/${strain.id}`}
                                            className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium">{strain.identifier}</span>
                                                {strain.seq && <Badge className="text-[10px] h-5">{tStrains('seqBadge')}</Badge>}
                                            </div>
                                            <div className="flex gap-2 text-xs text-muted-foreground">
                                                {strain.gramStain && (
                                                    <Badge variant="outline" className="text-[10px] h-5">
                                                        {tStrains('gramStain')} {strain.gramStain === 'POSITIVE' ? '+' : '-'}
                                                    </Badge>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    {t('noStrainsIsolated')}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
