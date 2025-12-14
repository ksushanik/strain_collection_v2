"use client"

import * as React from "react"
import { Suspense } from "react"
import { ApiService, Strain } from "@/services/api"
import { Loader2, ArrowLeft, Microscope, Dna, FlaskConical, FileText, Edit, Archive, Beaker, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSearchParams } from "next/navigation"
import { useRouter } from "@/i18n/routing"
import { StrainPhotoUpload } from "@/components/domain/strain-photo-upload"
import { useTranslations } from "next-intl"
import { useApiError } from "@/hooks/use-api-error"
import { RichTextDisplay } from "@/components/ui/rich-text-display"
import { useAuth } from "@/contexts/AuthContext"

function StrainDetailContent({ id }: { id: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const returnTo = searchParams?.get('returnTo')
    const t = useTranslations('Strains')
    const tCommon = useTranslations('Common')
    const { handleError } = useApiError()
    const { user } = useAuth()

    const [strain, setStrain] = React.useState<Strain | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [deleting, setDeleting] = React.useState(false)

    React.useEffect(() => {
        if (!id) return;
        const load = async () => {
            try {
                const strainData = await ApiService.getStrain(parseInt(id))
                setStrain(strainData)
            } catch (err) {
                console.error('Failed to load strain:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    const handleDelete = async () => {
        if (!strain) return
        const confirmed = window.confirm(t('deleteConfirm'))
        if (!confirmed) return
        setDeleting(true)
        try {
            await ApiService.deleteStrain(strain.id)
            router.push(returnTo || '/strains')
        } catch (err) {
            handleError(err, t('deleteFailed'))
        } finally {
            setDeleting(false)
        }
    }


    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!strain) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold">{t('strainNotFound')}</h1>
                <Button variant="link" onClick={() => router.back()}>{tCommon('prev')}</Button>
            </div>
        )
    }

    const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="sm" onClick={() => returnTo ? router.push(returnTo) : router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    {tCommon('back')}
                </Button>
                {canEdit && (
                    <>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() =>
                                router.push(`/strains/${strain.id}/edit${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`)
                            }
                        >
                            <Edit className="h-4 w-4 mr-1" />
                            {t('editStrain')}
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                                <Trash2 className="h-4 w-4 mr-1" />
                            )}
                            {tCommon('delete')}
                        </Button>
                    </>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{strain.identifier}</h1>
                    <p className="text-muted-foreground">
                        {t('sample')}: {strain.sample?.code || t('unknown')}   ID: {strain.id}
                    </p>
                </div>
                <div className="ml-auto flex gap-2">
                    {strain.seq && <Badge>{t('sequenced')}</Badge>}
                    {strain.gramStain && (
                        <Badge variant={strain.gramStain === 'POSITIVE' ? 'default' : 'secondary'}>
                            {t('gramStain')} {strain.gramStain === 'POSITIVE' ? '+' : '-'}
                        </Badge>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Microscope className="h-5 w-5" />
                            {t('taxonomy')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {strain.taxonomy16s ? (
                            <div className="text-sm">
                                <span className="font-medium italic">{strain.taxonomy16s}</span>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">{t('noTaxonomyInfo')}</p>
                        )}
                        {strain.otherTaxonomy && (
                            <div className="pt-4 border-t">
                                <span className="text-xs font-medium text-muted-foreground block mb-1">
                                    {t('otherIdentificationMethods')}:
                                </span>
                                <RichTextDisplay content={strain.otherTaxonomy} className="text-sm" />
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FlaskConical className="h-5 w-5" />
                            {t('growthAndTraits')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {strain.phosphates && <Badge variant="outline">{t('phosphates')} +</Badge>}
                            {strain.siderophores && <Badge variant="outline">{t('siderophores')} +</Badge>}
                            {strain.pigmentSecretion && <Badge variant="outline">{t('pigmentSecretion')} +</Badge>}
                            {strain.amylase && <Badge variant="outline">{t('amylase')} {strain.amylase}</Badge>}
                            {strain.antibioticActivity && (
                                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                                    {t('antibioticActivity')}
                                </Badge>
                            )}
                        </div>
                        {strain.antibioticActivity && (
                            <div className="mt-4 text-sm">
                                <span className="font-medium">{t('antibioticActivityDetails')}:</span>
                                <RichTextDisplay content={strain.antibioticActivity} className="text-muted-foreground mt-1" />
                            </div>
                        )}
                        {strain.iuk && (
                            <div className="mt-3 text-sm">
                                <span className="font-medium">{t('iukIaa')}:</span>
                                <p className="text-muted-foreground mt-1">{strain.iuk}</p>
                            </div>
                        )}
                        {strain.isolationRegion && (
                            <div className="mt-3 text-sm">
                                <span className="font-medium">{t('isolationRegion')}:</span>
                                <p className="text-muted-foreground mt-1">{strain.isolationRegion}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Dna className="h-5 w-5" />
                            {t('genetics')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{t('sequenced')}:</span>
                            <Badge variant={strain.seq ? "default" : "secondary"}>
                                {strain.seq ? t('yes') : t('no')}
                            </Badge>
                        </div>
                        {strain.genome && (
                            <div>
                                <span className="text-sm font-medium block mb-1">{t('genome')}:</span>
                                <RichTextDisplay content={strain.genome} className="text-sm text-muted-foreground bg-muted p-2 rounded" />
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            {t('additionalInfo')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        {strain.features && (
                            <div>
                                <span className="font-medium block mb-1">{t('features')}:</span>
                                <RichTextDisplay content={strain.features} className="text-muted-foreground" />
                            </div>
                        )}
                        {strain.biochemistry && (
                            <div>
                                <span className="font-medium block mb-1">{t('biochemistry')}:</span>
                                <RichTextDisplay content={strain.biochemistry} className="text-muted-foreground" />
                            </div>
                        )}
                        {strain.comments && (
                            <div>
                                <span className="font-medium block mb-1">{t('comments')}:</span>
                                <RichTextDisplay content={strain.comments} className="text-muted-foreground" />
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-2 pt-4 border-t mt-4">
                            <span className="font-medium">{t('indexer')}:</span>
                            <span>{strain.indexerInitials || '-'}</span>
                            <span className="font-medium">{t('rcam')}:</span>
                            <span>{strain.collectionRcam || '-'}</span>
                            <span className="font-medium">{t('isolationRegion')}:</span>
                            <span>{strain.isolationRegion || '-'}</span>
                            <span className="font-medium">{t('iukIaa')}:</span>
                            <span>{strain.iuk || '-'}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Beaker className="h-5 w-5" />
                            {t('media')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        {strain.media && strain.media.length > 0 ? (
                            <div className="space-y-2">
                                {strain.media.map((m) => (
                                    <div key={m.mediaId} className="flex items-start justify-between rounded border p-2">
                                        <div>
                                            <div className="font-medium">{m.media.name}</div>
                                            {m.media.composition && (
                                                <RichTextDisplay content={m.media.composition} className="text-muted-foreground text-xs mt-1" />
                                            )}
                                            {m.notes && <div className="text-muted-foreground text-xs mt-1">{t('notes')}: {m.notes}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">{t('noMediaLinked')}</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Archive className="h-5 w-5" />
                            {t('storageLocations')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        {strain.storage && strain.storage.length > 0 ? (
                            strain.storage.map((s) => (
                                <button
                                    key={s.id}
                                    className="w-full text-left flex items-center justify-between rounded border p-2 hover:bg-muted/60"
                                    onClick={() =>
                                        window.location.href = `/dynamic/storage?boxId=${s.cell.box.id}&cell=${s.cell.cellCode}`
                                    }
                                >
                                    <div>
                                        <div className="font-medium">{s.cell.box.displayName}</div>
                                        <div className="text-muted-foreground text-xs">{t('cell')}: {s.cell.cellCode}</div>
                                    </div>
                                    {s.isPrimary && <Badge variant="secondary" className="text-[10px]">{t('primary')}</Badge>}
                                </button>
                            ))
                        ) : (
                            <p className="text-muted-foreground">{t('notAllocated')}</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('strainPhotos')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <StrainPhotoUpload
                        strainId={strain.id}
                        existingPhotos={strain.photos || []}
                        readOnly
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default function StrainDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
    const { id } = React.use(params)
    return (
        <Suspense fallback={<div className="p-8">Loading...</div>}>
            <StrainDetailContent id={id} />
        </Suspense>
    )
}
