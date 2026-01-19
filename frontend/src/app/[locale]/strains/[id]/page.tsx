"use client"

import * as React from "react"
import { Suspense } from "react"
import { ApiService, Strain } from "@/services/api"
import { Loader2, ArrowLeft, Microscope, Dna, FlaskConical, Edit, Archive, Trash2, Camera, Info, Beaker } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSearchParams } from "next/navigation"
import { routing, usePathname, useRouter } from "@/i18n/routing"
import { StrainPhotoUpload } from "@/components/domain/strain-photo-upload"
import { useTranslations } from "next-intl"
import { useApiError } from "@/hooks/use-api-error"
import { RichTextDisplay } from "@/components/ui/rich-text-display"
import { useAuth } from "@/contexts/AuthContext"
import { TraitDataType } from "@/services/api"
import { getTraitDisplayName } from "@/lib/trait-labels"
import { formatSampleCodeForDisplay } from "@/lib/sample-code"

type Phenotype = NonNullable<Strain["phenotypes"]>[number]
type RoutingLocale = (typeof routing.locales)[number]

function isRoutingLocale(value: string | undefined): value is RoutingLocale {
    return routing.locales.includes(value as RoutingLocale)
}

function normalizeReturnPath(returnPath: string | null, pathname: string | null) {
    if (!returnPath) return null
    if (!returnPath.startsWith("/") || !pathname) return returnPath

    const pathLocale = pathname.split("/")[1]
    const baseLocale = returnPath.split("/")[1]
    const hasPathLocale = isRoutingLocale(pathLocale)
    const hasBaseLocale = isRoutingLocale(baseLocale)

    if (hasPathLocale && !hasBaseLocale) {
        return `/${pathLocale}${returnPath}`
    }

    return returnPath
}

// Standard Card-like Section Block
function SectionBlock({
    title, 
    icon: Icon, 
    children, 
    className = "" 
}: { 
    title: string
    icon?: React.ElementType
    children: React.ReactNode
    className?: string 
}) {
    return (
        <div className={`rounded-xl border bg-card text-card-foreground shadow-sm ${className}`}>
            <div className="flex items-center gap-2 p-6 pb-3">
                {Icon && <Icon className="h-5 w-5" />}
                <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
            </div>
            <div className="p-6 pt-0">
                {children}
            </div>
        </div>
    )
}

function StrainDetailContent({ id }: { id: string }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const returnTo = searchParams?.get('returnTo')
    const normalizedReturnTo = normalizeReturnPath(returnTo, pathname)
    const t = useTranslations('Strains')
    const tCommon = useTranslations('Common')
    const { handleError } = useApiError()
    const { user } = useAuth()

    const [strain, setStrain] = React.useState<Strain | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [deleting, setDeleting] = React.useState(false)

    const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    const getTraitCode = React.useCallback((p: Phenotype | null | undefined) => {
        return p?.traitCode || p?.traitDefinition?.code || null
    }, [])

    const getTraitName = React.useCallback((p: Phenotype | null | undefined) => {
        return (p as { traitDefinition?: { name?: string } | null } | null | undefined)?.traitDefinition?.name || p?.traitName || ""
    }, [])

    const getDataType = React.useCallback((p: Phenotype | null | undefined): TraitDataType => {
        return (
            (p as { dataType?: TraitDataType; traitDefinition?: { dataType?: TraitDataType } | null } | null | undefined)?.dataType ||
            (p as { traitDefinition?: { dataType?: TraitDataType } | null } | null | undefined)?.traitDefinition?.dataType ||
            TraitDataType.TEXT
        )
    }, [])

    const definedPhenotypes = React.useMemo(() => {
        const phenotypes = (strain?.phenotypes ?? []) as Phenotype[]
        return phenotypes.filter((p) => {
            const dataType = getDataType(p)
            if (dataType === TraitDataType.BOOLEAN) return p?.result === "true"
            return typeof p?.result === "string" && p.result.trim().length > 0
        })
    }, [getDataType, strain?.phenotypes])

    const gramPhenotype = React.useMemo(() => {
        return (
            (strain?.phenotypes ?? []).find((p) => getTraitCode(p as Phenotype) === "gram_stain") ||
            (strain?.phenotypes ?? []).find((p) => (p as Phenotype)?.traitName === "Gram Stain") ||
            null
        )
    }, [getTraitCode, strain?.phenotypes])

    const gramLabel = React.useMemo(() => {
        const raw = gramPhenotype?.result
        if (!raw || !String(raw).trim()) return "-"

        const normalized = String(raw).trim().toLowerCase()
        if (normalized === "+" || normalized.includes("+")) return "+"
        if (normalized === "-" || normalized.includes("-")) return "-"
        if (normalized.includes("variable")) return t("variable")

        return String(raw).trim()
    }, [gramPhenotype, t])

    const compactChips = React.useMemo(() => {
        const chips: { label: string; suffix?: string }[] = []

        // Prefer showing only "signal" traits compactly
        const codesInOrder = [
            "siderophore_production",
            "pigment_secretion",
            "phosphate_solubilization",
            "sequenced_seq",
            "amylase",
        ]

        const findByCode = (code: string) =>
            definedPhenotypes.find((p) => getTraitCode(p) === code) || null

        for (const code of codesInOrder) {
            const p = findByCode(code)
            if (!p) continue
            const name = getTraitDisplayName(code, getTraitName(p), t)
            const dataType = getDataType(p)

            if (dataType === TraitDataType.BOOLEAN) {
                chips.push({ label: name, suffix: "+" })
                continue
            }

            if (dataType === TraitDataType.CATEGORICAL) {
                const result = String(p.result || "").trim()
                if (!result) continue
                const normalized = result.toLowerCase()
                const suffix =
                    normalized === "+" || result.includes("+")
                        ? "+"
                        : normalized === "-" || result.includes("-")
                            ? "-"
                            : result
                chips.push({ label: name, suffix })
            }
        }

        return chips
    }, [definedPhenotypes, getDataType, getTraitName, getTraitCode, t])

    const isolationRegionLabel = React.useMemo(() => {
        const value = strain?.isolationRegion
        if (!value) return null
        return value === "RHIZOSPHERE"
            ? t("regionRhizosphere")
            : value === "ENDOSPHERE"
                ? t("regionEndosphere")
                : value === "PHYLLOSPHERE"
                    ? t("regionPhyllosphere")
                    : value === "SOIL"
                        ? t("regionSoil")
                        : value === "OTHER"
                            ? t("regionOther")
                            : value
    }, [strain?.isolationRegion, t])

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
            router.push(normalizedReturnTo || '/strains')
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

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
            {/* Header Navigation & Actions */}
            <div className="flex items-center gap-4 mb-2">
                <Button variant="ghost" size="sm" onClick={() => normalizedReturnTo ? router.push(normalizedReturnTo) : router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    {tCommon('back')}
                </Button>
                <div className="ml-auto flex gap-2">
                    {canEdit && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.push(`/strains/${strain.id}/edit${normalizedReturnTo ? `?returnTo=${encodeURIComponent(normalizedReturnTo)}` : ""}`)
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
            </div>

            {/* Title & Badges */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">{strain.identifier}</h1>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                        <span>{t('sample')}: <span className="font-medium text-foreground">{strain.sample?.code ? formatSampleCodeForDisplay(strain.sample.code) : t('unknown')}</span></span>
                        <span className="text-border">|</span>
                        <span className="text-xs">ID: {strain.id}</span>
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <Badge className="rounded-full bg-foreground text-background px-3 py-1 text-sm">
                        {t("gramStain")} {gramLabel}
                    </Badge>
                    {strain.biosafetyLevel && (
                        <Badge variant={strain.biosafetyLevel === 'BSL_1' ? 'secondary' : 'destructive'} className="text-sm px-3 py-1">
                            {t(strain.biosafetyLevel.toLowerCase().replace('_', ''))}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Content Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* COLUMN 1 */}
                <div className="space-y-6">
                    {/* TAXONOMY */}
                    <SectionBlock title={t('taxonomy')} icon={Microscope}>
                        <div className="space-y-4">
                            {strain.ncbiScientificName && (
                                <div className="text-sm">
                                    <span className="font-medium block mb-1 text-muted-foreground">{t('ncbiScientificName')}</span>
                                    <span className="text-lg italic font-medium">{strain.ncbiScientificName}</span>
                                    {strain.ncbiTaxonomyId && (
                                        <span className="text-xs text-muted-foreground ml-2 bg-muted px-1.5 py-0.5 rounded">(TaxID: {strain.ncbiTaxonomyId})</span>
                                    )}
                                </div>
                            )}
                            {strain.taxonomy16s && (
                                <div className="text-sm">
                                    <span className="font-medium block mb-1 text-muted-foreground">{t('taxonomy16s')}</span>
                                    <span className="italic">{strain.taxonomy16s}</span>
                                </div>
                            )}
                            {!strain.ncbiScientificName && !strain.taxonomy16s && (
                                <p className="text-sm text-muted-foreground italic">{t('noTaxonomyInfo')}</p>
                            )}
                            {strain.otherTaxonomy && (
                                <div className="pt-3 border-t border-dashed">
                                    <span className="text-xs font-medium text-muted-foreground block mb-1">
                                        {t('otherIdentificationMethods')}
                                    </span>
                                    <RichTextDisplay content={strain.otherTaxonomy} className="text-sm" />
                                </div>
                            )}
                        </div>
                    </SectionBlock>

                    {/* GENETICS */}
                    <SectionBlock title={t('genetics')} icon={Dna}>
                         <div className="space-y-4">
                            {strain.genetics && (
                                <>
                                    <div className="flex items-center justify-between p-3 border rounded-md bg-muted/10">
                                        <span className="text-sm font-medium">{t('wgsStatus')}</span>
                                        <Badge variant={strain.genetics.wgsStatus === 'NONE' ? 'secondary' : 'default'}>
                                            {t(strain.genetics.wgsStatus === 'NONE' ? 'wgsStatusNone' : 
                                               strain.genetics.wgsStatus === 'PLANNED' ? 'wgsStatusPlanned' :
                                               strain.genetics.wgsStatus === 'SEQUENCED' ? 'wgsStatusSequenced' :
                                               strain.genetics.wgsStatus === 'ASSEMBLED' ? 'wgsStatusAssembled' :
                                               'wgsStatusPublished')}
                                        </Badge>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {strain.genetics.assemblyAccession && (
                                            <div className="p-2.5 border rounded-md">
                                                 <span className="text-xs font-medium block text-muted-foreground mb-0.5">{t('assemblyAccession')}</span>
                                                 <span className="font-mono text-sm">{strain.genetics.assemblyAccession}</span>
                                            </div>
                                        )}
                                        {strain.genetics.marker16sAccession && (
                                            <div className="p-2.5 border rounded-md">
                                                 <span className="text-xs font-medium block text-muted-foreground mb-0.5">{t('marker16sAccession')}</span>
                                                 <span className="font-mono text-sm">{strain.genetics.marker16sAccession}</span>
                                            </div>
                                        )}
                                    </div>

                                    {strain.genetics.marker16sSequence && (
                                        <div className="space-y-1.5">
                                             <span className="text-xs font-medium block text-muted-foreground">{t('marker16sSequence')}</span>
                                             <div className="bg-muted p-3 rounded-md text-[10px] font-mono break-all max-h-[150px] overflow-y-auto border">
                                                {strain.genetics.marker16sSequence}
                                             </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </SectionBlock>

                    {/* MEDIA */}
                    <SectionBlock title={t('media')} icon={Beaker}>
                        {strain.media && strain.media.length > 0 ? (
                            <div className="space-y-2">
                                {strain.media.map((m) => (
                                    <div key={m.mediaId} className="flex flex-col rounded-md border p-3 bg-card">
                                        <div className="font-medium text-sm mb-1">{m.media.name}</div>
                                        {m.media.composition && (
                                            <RichTextDisplay content={m.media.composition} className="text-muted-foreground text-xs mb-2 bg-muted/30 p-2 rounded" />
                                        )}
                                        {m.notes && (
                                            <div className="text-xs text-muted-foreground border-t pt-2 mt-1">
                                                <span className="font-semibold">{t('notes')}:</span> {m.notes}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-muted-foreground text-sm italic p-3 border rounded-md border-dashed text-center bg-muted/10">
                                {t('noMediaLinked')}
                            </div>
                        )}
                    </SectionBlock>
                </div>

                {/* COLUMN 2 */}
                <div className="space-y-6">
                    {/* PHENOTYPES */}
                    <SectionBlock title={t('growthAndTraits')} icon={FlaskConical}>
                        <div className="space-y-4">
                            {compactChips.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {compactChips.map((c) => (
                                        <Badge key={`${c.label}-${c.suffix ?? ""}`} variant="outline" className="rounded-full px-3 py-1">
                                            {c.label}{c.suffix ? ` ${c.suffix}` : ""}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">{t('noTraitsAdded')}</p>
                            )}
                        </div>

                        <div className="space-y-3 text-sm">
                            {strain.features && (
                                <div className="p-3 rounded-md border bg-muted/10">
                                    <span className="font-medium block mb-1 text-xs uppercase tracking-wide text-muted-foreground">{t('features')}</span>
                                    <RichTextDisplay content={strain.features} className="text-sm" />
                                </div>
                            )}
                        </div>
                    </SectionBlock>

                    {/* ADDITIONAL INFO */}
                    <SectionBlock title={t('additionalInfo')} icon={Info}>
                         <div className="space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-3 pb-3 border-b">
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground block">{t('indexer')}</span>
                                    <span>{strain.indexerInitials || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground block">{t('rcam')}</span>
                                    <span>{strain.collectionRcam || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground block">{t('isolationRegion')}</span>
                                    <span>{isolationRegionLabel || strain.isolationRegion || '-'}</span>
                                </div>
                            </div>
                            {strain.comments && (
                                <div>
                                    <span className="font-medium block mb-1 text-muted-foreground">{t('comments')}</span>
                                    <RichTextDisplay content={strain.comments} className="text-sm bg-muted/10 p-2 rounded" />
                                </div>
                            )}
                        </div>
                    </SectionBlock>

                    {/* STORAGE */}
                    <SectionBlock title={t('storageLocations')} icon={Archive}>
                        <div className="space-y-4">
                            {strain.storage && strain.storage.length > 0 ? (
                                <div className="grid gap-2">
                                    {strain.storage.map((s) => (
                                        <a
                                            key={s.id}
                                            href={`/dynamic/storage?boxId=${s.cell.box.id}&cell=${s.cell.cellCode}`}
                                            className="block w-full text-left rounded-md border p-3 hover:bg-muted/50 transition-colors bg-card"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium text-sm">{s.cell.box.displayName}</div>
                                                    <div className="text-muted-foreground text-xs">{t('cell')}: <span className="font-mono text-foreground">{s.cell.cellCode}</span></div>
                                                </div>
                                                {s.isPrimary && <Badge variant="secondary" className="text-[10px] h-5">{t('primary')}</Badge>}
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-muted-foreground text-sm italic p-3 border rounded-md border-dashed text-center bg-muted/10">
                                    {t('notAllocated')}
                                </div>
                            )}
                        </div>
                    </SectionBlock>
                </div>
                
                {/* BOTTOM FULL WIDTH - PHOTOS */}
                <div className="md:col-span-2">
                    <SectionBlock title={t('photosCardTitle')} icon={Camera}>
                         <StrainPhotoUpload
                            strainId={strain.id}
                            existingPhotos={strain.photos || []}
                            readOnly={!canEdit}
                            onPhotosChange={
                                canEdit
                                    ? () => ApiService.getStrain(strain.id).then(setStrain).catch(console.error)
                                    : undefined
                            }
                        />
                    </SectionBlock>
                </div>

            </div>
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
