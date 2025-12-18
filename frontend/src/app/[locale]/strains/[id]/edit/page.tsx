"use client"

import * as React from "react"
import { Suspense } from "react"

import { StrainForm } from "@/components/domain/strain-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiService, Media, Strain } from "@/services/api"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { useRouter } from "@/i18n/routing"
import { useSearchParams } from "next/navigation"
import { StrainPhotoUpload } from "@/components/domain/strain-photo-upload"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RichTextDisplay } from "@/components/ui/rich-text-display"
import { useApiError } from "@/hooks/use-api-error"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

type BoxSummary = {
    id: number;
    displayName: string;
    rows: number;
    cols: number;
    description?: string;
    _count?: { cells: number };
    occupiedCells?: number;
    freeCells?: number;
}

type BoxDetail = {
    id: number;
    displayName: string;
    rows: number;
    cols: number;
    description?: string;
    cells: {
        id: number;
        row: number;
        col: number;
        cellCode: string;
        status: 'FREE' | 'OCCUPIED';
        strain?: { isPrimary?: boolean; strain?: { id: number; identifier: string; seq: boolean } } | null;
    }[];
}

function EditStrainContent({ id }: { id: string }) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const t = useTranslations('Strains')
    const returnTo = searchParams?.get("returnTo") || undefined
    const { handleError } = useApiError()
    const [strain, setStrain] = React.useState<Strain | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [formSubmitting, setFormSubmitting] = React.useState(false)
    const [mediaOptions, setMediaOptions] = React.useState<Media[]>([])
    const [savingMedia, setSavingMedia] = React.useState(false)
    const [mediaForm, setMediaForm] = React.useState<{ mediaId?: number; notes?: string }>({})
    const [boxes, setBoxes] = React.useState<BoxSummary[]>([])
    const [selectedBoxId, setSelectedBoxId] = React.useState<number | null>(null)
    const [selectedBox, setSelectedBox] = React.useState<BoxDetail | null>(null)
    const [allocatingStorage, setAllocatingStorage] = React.useState(false)
    const [storageForm, setStorageForm] = React.useState<{ boxId?: number; cellCode?: string; isPrimary?: boolean }>({})

    React.useEffect(() => {
        Promise.all([
            ApiService.getStrain(parseInt(id)),
            ApiService.getMedia({ page: 1, limit: 100 }),
            ApiService.getStorageBoxes(),
        ])
            .then(([strainData, mediaList, boxList]) => {
                setStrain(strainData)
                setMediaOptions(mediaList.data || [])
                setBoxes(boxList)
            })
            .catch(err => {
                console.error(err)
                handleError(err, t('failedToLoadStrain'))
            })
            .finally(() => setLoading(false))
    }, [handleError, id, t])

    const refreshStrain = React.useCallback(async () => {
        try {
            const updated = await ApiService.getStrain(parseInt(id))
            setStrain(updated)
        } catch (err) {
            console.error('Failed to refresh strain:', err)
        }
    }, [id])

    const refreshSelectedBox = React.useCallback(async (boxId: number | null) => {
        if (!boxId) {
            setSelectedBox(null)
            return
        }
        try {
            const box = await ApiService.getBoxCells(boxId)
            setSelectedBox(box)
        } catch (err) {
            handleError(err, t('failedToLoadCells'))
        }
    }, [handleError, t])

    React.useEffect(() => {
        if (boxes.length > 0 && !selectedBoxId) {
            const firstId = boxes[0].id
            setSelectedBoxId(firstId)
            setStorageForm((prev) => ({ ...prev, boxId: prev.boxId ?? firstId }))
        }
    }, [boxes, selectedBoxId])

    React.useEffect(() => {
        if (!selectedBoxId) return
        refreshSelectedBox(selectedBoxId)
    }, [refreshSelectedBox, selectedBoxId])

    React.useEffect(() => {
        const hasPrimary = !!strain?.storage?.some((s) => s.isPrimary)
        setStorageForm((prev) => ({
            ...prev,
            isPrimary: hasPrimary ? false : true,
        }))
    }, [strain?.storage])

    const handleLinkMedia = async () => {
        if (!strain || !mediaForm.mediaId) return
        setSavingMedia(true)
        try {
            await ApiService.linkMediaToStrain(strain.id, {
                mediaId: mediaForm.mediaId,
                notes: mediaForm.notes,
            })
            await refreshStrain()
            setMediaForm({})
        } catch (err) {
            console.error('Failed to link media', err)
        } finally {
            setSavingMedia(false)
        }
    }

    const handleUnlinkMedia = async (mediaId: number) => {
        if (!strain) return
        setSavingMedia(true)
        try {
            await ApiService.unlinkMediaFromStrain(strain.id, mediaId)
            await refreshStrain()
        } catch (err) {
            console.error('Failed to unlink media', err)
        } finally {
            setSavingMedia(false)
        }
    }

    const handleAllocateStorage = async () => {
        if (!strain || !storageForm.boxId || !storageForm.cellCode) return
        setAllocatingStorage(true)
        try {
            await ApiService.allocateCell(storageForm.boxId, storageForm.cellCode, {
                strainId: strain.id,
                isPrimary: storageForm.isPrimary,
            })
            await refreshStrain()
            await refreshSelectedBox(storageForm.boxId)
            setStorageForm((prev) => ({
                ...prev,
                cellCode: undefined,
                isPrimary: strain.storage && strain.storage.length > 0 ? false : true,
            }))
        } catch (err) {
            handleError(err, t('failedToAllocate'))
        } finally {
            setAllocatingStorage(false)
        }
    }

    const handleMakePrimary = async (boxId: number, cellCode: string) => {
        if (!strain) return
        setAllocatingStorage(true)
        try {
            await ApiService.allocateCell(boxId, cellCode, { strainId: strain.id, isPrimary: true })
            await refreshStrain()
            await refreshSelectedBox(boxId)
        } catch (err) {
            handleError(err, t('failedToAllocate'))
        } finally {
            setAllocatingStorage(false)
        }
    }

    const handleUnallocate = async (boxId: number, cellCode: string) => {
        setAllocatingStorage(true)
        try {
            await ApiService.unallocateCell(boxId, cellCode)
            await refreshStrain()
            await refreshSelectedBox(boxId)
        } catch (err) {
            handleError(err, t('failedToUnallocate'))
        } finally {
            setAllocatingStorage(false)
        }
    }

    const freeCells = React.useMemo(() => selectedBox?.cells.filter((c) => c.status === 'FREE') || [], [selectedBox])
    const hasPrimary = !!strain?.storage?.some((s) => s.isPrimary)

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!strain) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                {t('strainNotFound')}
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{t('editTitle')}</h1>
                <p className="text-muted-foreground">
                    {t('editSubtitle')}
                </p>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>{t('detailsCardTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <StrainForm
                        initialData={strain}
                        isEdit
                        returnTo={returnTo}
                        formId="strain-form-edit"
                        showActions={false}
                        onSubmittingChange={setFormSubmitting}
                    />
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>{t('mediaCardTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {strain.media && strain.media.length > 0 ? (
                        <div className="space-y-2">
                            {strain.media.map((m) => (
                                <div key={m.mediaId} className="flex items-start justify-between rounded border p-2">
                                    <div>
                                        <div className="font-medium">{m.media.name}</div>
                                        {m.media.composition && (
                                            <RichTextDisplay content={m.media.composition} className="text-muted-foreground text-xs mt-1" />
                                        )}
                                        {m.notes && <div className="text-muted-foreground text-xs mt-1">{t('mediaNotes')}: {m.notes}</div>}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive"
                                        onClick={() => handleUnlinkMedia(m.mediaId)}
                                        disabled={savingMedia}
                                        title={t('remove')}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">{t('noMedia')}</p>
                    )}

                    <div className="rounded border p-3 space-y-2">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                            <Select
                                value={mediaForm.mediaId?.toString()}
                                onValueChange={(val) => setMediaForm((prev) => ({ ...prev, mediaId: parseInt(val) }))}
                            >
                                <SelectTrigger className="md:w-64">
                                    <SelectValue placeholder={t('selectMedia')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {mediaOptions.map((option) => (
                                        <SelectItem key={option.id} value={option.id.toString()}>
                                            {option.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                placeholder={t('notesOptional')}
                                value={mediaForm.notes || ""}
                                onChange={(e) => setMediaForm((prev) => ({ ...prev, notes: e.target.value }))}
                            />
                            <Button
                                size="sm"
                                onClick={handleLinkMedia}
                                disabled={!mediaForm.mediaId || savingMedia}
                            >
                                {savingMedia ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                                {t('link')}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>{t('storageCardTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {strain.storage && strain.storage.length > 0 ? (
                        <div className="space-y-2">
                            {strain.storage.map((s) => (
                                <div key={s.id} className="flex flex-col gap-2 rounded border p-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <div className="font-medium">{s.cell.box.displayName}</div>
                                        <div className="text-xs text-muted-foreground">{t('cellLabel')}: {s.cell.cellCode}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {s.isPrimary && <Badge variant="secondary">{t('primary')}</Badge>}
                                        {!s.isPrimary && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleMakePrimary(s.cell.box.id, s.cell.cellCode)}
                                                disabled={allocatingStorage}
                                            >
                                                {t('makePrimary')}
                                            </Button>
                                        )}
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-destructive"
                                            onClick={() => handleUnallocate(s.cell.box.id, s.cell.cellCode)}
                                            disabled={allocatingStorage}
                                            title="Remove"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">{t('noStorage')}</p>
                    )}

                    <div className="rounded border p-3 space-y-3">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                            <Select
                                value={storageForm.boxId?.toString()}
                                onValueChange={(val) => {
                                    const parsed = parseInt(val)
                                    setStorageForm((prev) => ({ ...prev, boxId: parsed, cellCode: undefined }))
                                    setSelectedBoxId(parsed)
                                }}
                            >
                                <SelectTrigger className="md:w-64">
                                    <SelectValue placeholder={t('selectBox')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {boxes.map((box) => (
                                        <SelectItem key={box.id} value={box.id.toString()}>
                                            {box.displayName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={storageForm.cellCode}
                                onValueChange={(val) => setStorageForm((prev) => ({ ...prev, cellCode: val }))}
                                disabled={!storageForm.boxId || freeCells.length === 0}
                            >
                                <SelectTrigger className="md:w-48">
                                    <SelectValue placeholder={storageForm.boxId ? t('selectCell') : t('chooseBoxFirst')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {freeCells.length === 0 && <SelectItem value="none" disabled>{t('noFreeCells')}</SelectItem>}
                                    {freeCells.map((cell) => (
                                        <SelectItem key={cell.id} value={cell.cellCode}>
                                            {cell.cellCode}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="storage-primary"
                                    checked={storageForm.isPrimary ?? false}
                                    onCheckedChange={(checked) =>
                                        setStorageForm((prev) => ({ ...prev, isPrimary: checked === true }))
                                    }
                                />
                                <label htmlFor="storage-primary" className="text-sm leading-none">
                                    {t('primaryAllocation')}
                                </label>
                            </div>

                            <Button
                                size="sm"
                                onClick={handleAllocateStorage}
                                disabled={!storageForm.boxId || !storageForm.cellCode || allocatingStorage}
                            >
                                {allocatingStorage ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                                Add allocation
                            </Button>
                        </div>
                        {!hasPrimary && strain.storage && strain.storage.length > 0 && (
                            <p className="text-xs text-muted-foreground">{t('noPrimaryWarning')}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>{t('photosCardTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <StrainPhotoUpload
                        strainId={strain.id}
                        existingPhotos={strain.photos || []}
                        onPhotosChange={() => ApiService.getStrain(strain.id).then(setStrain).catch(console.error)}
                    />
                </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                        if (returnTo) {
                            router.push(returnTo)
                        } else {
                            router.back()
                        }
                    }}
                >
                    {t('cancel')}
                </Button>
                <Button
                    type="button"
                    disabled={formSubmitting}
                    onClick={() => {
                        const el = document.getElementById("strain-form-edit")
                        if (!(el instanceof HTMLFormElement)) {
                            toast.error("Form not found")
                            return
                        }
                        el.requestSubmit()
                    }}
                >
                    {formSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('saveChanges')}
                </Button>
            </div>
        </div>
    )
}

export default function EditStrainPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const tCommon = useTranslations('Common')
    return (
        <Suspense fallback={<div className="p-8">{tCommon('loading')}</div>}>
            <EditStrainContent id={id} />
        </Suspense>
    )
}
