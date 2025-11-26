"use client"

import * as React from "react"
import { Suspense } from "react"

import { StrainForm } from "@/components/domain/strain-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiService, Media, Strain } from "@/services/api"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { StrainPhotoUpload } from "@/components/domain/strain-photo-upload"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

function EditStrainContent({ id }: { id: string }) {
    const searchParams = useSearchParams()
    const returnTo = searchParams?.get("returnTo") || undefined
    const [strain, setStrain] = React.useState<Strain | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [mediaOptions, setMediaOptions] = React.useState<Media[]>([])
    const [savingMedia, setSavingMedia] = React.useState(false)
    const [mediaForm, setMediaForm] = React.useState<{ mediaId?: number; notes?: string }>({})

    React.useEffect(() => {
        Promise.all([
            ApiService.getStrain(parseInt(id)),
            ApiService.getMedia({ page: 1, limit: 100 }),
        ])
            .then(([strainData, mediaList]) => {
                setStrain(strainData)
                setMediaOptions(mediaList.data || [])
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [id])

    const refreshStrain = React.useCallback(async () => {
        try {
            const updated = await ApiService.getStrain(parseInt(id))
            setStrain(updated)
        } catch (err) {
            console.error('Failed to refresh strain:', err)
        }
    }, [id])

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
