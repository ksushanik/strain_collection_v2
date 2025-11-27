"use client"

import * as React from "react"
import { Suspense } from "react"

import { StrainForm } from "@/components/domain/strain-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiService, Media, Strain } from "@/services/api"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { StrainPhotoUpload } from "@/components/domain/strain-photo-upload"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useApiError } from "@/hooks/use-api-error"

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
    const returnTo = searchParams?.get("returnTo") || undefined
    const { handleError } = useApiError()
    const [strain, setStrain] = React.useState<Strain | null>(null)
    const [loading, setLoading] = React.useState(true)
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
                handleError(err, "Не удалось загрузить данные штамма")
            })
            .finally(() => setLoading(false))
    }, [handleError, id])

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
            handleError(err, "Не удалось загрузить ячейки бокса")
        }
    }, [handleError])

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
            handleError(err, "Не удалось добавить размещение")
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
            handleError(err, "Не удалось изменить основной слот")
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
            handleError(err, "Не удалось удалить размещение")
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
                Strain not found
            </div>
        )
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Edit Strain</h1>
                <p className="text-muted-foreground">
                    Update strain details.
                </p>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Strain Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <StrainForm initialData={strain} isEdit returnTo={returnTo} />
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Growth Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {strain.media && strain.media.length > 0 ? (
                        <div className="space-y-2">
                            {strain.media.map((m) => (
                                <div key={m.mediaId} className="flex items-start justify-between rounded border p-2">
                                    <div>
                                        <div className="font-medium">{m.media.name}</div>
                                        {m.media.composition && (
                                            <div className="text-muted-foreground text-xs mt-1 whitespace-pre-line">
                                                {m.media.composition}
                                            </div>
                                        )}
                                        {m.notes && <div className="text-muted-foreground text-xs mt-1">Notes: {m.notes}</div>}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive"
                                        onClick={() => handleUnlinkMedia(m.mediaId)}
                                        disabled={savingMedia}
                                        title="Remove"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No media linked</p>
                    )}

                    <div className="rounded border p-3 space-y-2">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                            <Select
                                value={mediaForm.mediaId?.toString()}
                                onValueChange={(val) => setMediaForm((prev) => ({ ...prev, mediaId: parseInt(val) }))}
                            >
                                <SelectTrigger className="md:w-64">
                                    <SelectValue placeholder="Select media" />
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
                                placeholder="Notes (optional)"
                                value={mediaForm.notes || ""}
                                onChange={(e) => setMediaForm((prev) => ({ ...prev, notes: e.target.value }))}
                            />
                            <Button
                                size="sm"
                                onClick={handleLinkMedia}
                                disabled={!mediaForm.mediaId || savingMedia}
                            >
                                {savingMedia ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                                Link
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Storage Allocation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {strain.storage && strain.storage.length > 0 ? (
                        <div className="space-y-2">
                            {strain.storage.map((s) => (
                                <div key={s.id} className="flex flex-col gap-2 rounded border p-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <div className="font-medium">{s.cell.box.displayName}</div>
                                        <div className="text-xs text-muted-foreground">Cell: {s.cell.cellCode}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {s.isPrimary && <Badge variant="secondary">Primary</Badge>}
                                        {!s.isPrimary && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleMakePrimary(s.cell.box.id, s.cell.cellCode)}
                                                disabled={allocatingStorage}
                                            >
                                                Make primary
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
                        <p className="text-muted-foreground">Strain is not allocated to storage.</p>
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
                                    <SelectValue placeholder="Select box" />
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
                                    <SelectValue placeholder={storageForm.boxId ? "Select cell" : "Choose box first"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {freeCells.length === 0 && <SelectItem value="none" disabled>No free cells</SelectItem>}
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
                                    Primary allocation
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
                            <p className="text-xs text-muted-foreground">У штамма пока нет Primary allocation. Выберите выделение, чтобы отметить его основным.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Strain Photos</CardTitle>
                </CardHeader>
                <CardContent>
                    <StrainPhotoUpload
                        strainId={strain.id}
                        existingPhotos={strain.photos || []}
                        onPhotosChange={() => ApiService.getStrain(strain.id).then(setStrain).catch(console.error)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default function EditStrainPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    return (
        <Suspense fallback={<div className="p-8">Loading...</div>}>
            <EditStrainContent id={id} />
        </Suspense>
    )
}
