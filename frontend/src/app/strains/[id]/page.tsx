"use client"

import * as React from "react"
import { Suspense } from "react"
import { ApiService, Strain, Media } from "@/services/api"
import { MainLayout } from "@/components/layout/main-layout"
import { Loader2, ArrowLeft, Microscope, Dna, FlaskConical, FileText, Edit, Archive, Beaker, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function StrainDetailContent({ id }: { id: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const returnTo = searchParams?.get("returnTo") || undefined
    const [strain, setStrain] = React.useState<Strain | null>(null)
    const [mediaOptions, setMediaOptions] = React.useState<Media[]>([])
    const [loading, setLoading] = React.useState(true)
    const [savingMedia, setSavingMedia] = React.useState(false)
    const [mediaForm, setMediaForm] = React.useState<{ mediaId?: number; notes?: string }>({})

    React.useEffect(() => {
        if (!id) return;
        const load = async () => {
            try {
                const [strainData, mediaList] = await Promise.all([
                    ApiService.getStrain(parseInt(id)),
                    ApiService.getMedia({ page: 1, limit: 100 }),
                ])
                setStrain(strainData)
                setMediaOptions(mediaList.data)
            } catch (err) {
                console.error('Failed to load strain:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    const refreshStrain = async () => {
        try {
            const updated = await ApiService.getStrain(parseInt(id))
            setStrain(updated)
        } catch (err) {
            console.error('Failed to refresh strain:', err)
        }
    }

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
            <MainLayout>
                <div className="flex h-screen items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </MainLayout>
        )
    }

    if (!strain) {
        return (
            <MainLayout>
                <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold">Strain not found</h1>
                    <Button variant="link" onClick={() => router.back()}>Go back</Button>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="p-8 space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="sm" onClick={() => returnTo ? router.push(returnTo) : router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() =>
                            router.push(`/strains/${strain.id}/edit${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`)
                        }
                    >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit Strain
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{strain.identifier}</h1>
                        <p className="text-muted-foreground">
                            Sample: {strain.sample?.code || 'Unknown'}  ID: {strain.id}
                        </p>
                    </div>
                    <div className="ml-auto flex gap-2">
                        {strain.seq && <Badge>SEQ</Badge>}
                        {strain.gramStain && (
                            <Badge variant={strain.gramStain === 'POSITIVE' ? 'default' : 'secondary'}>
                                Gram {strain.gramStain === 'POSITIVE' ? '+' : '-'}
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Microscope className="h-5 w-5" />
                                Taxonomy
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {strain.taxonomy16s && (
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <span className="font-medium">Genus:</span>
                                    <span>{(strain.taxonomy16s as any)?.genus}</span>
                                    <span className="font-medium">Species:</span>
                                    <span>{(strain.taxonomy16s as any)?.species}</span>
                                </div>
                            )}
                            {strain.otherTaxonomy && (
                                <div className="pt-2 border-t">
                                    <span className="text-sm font-medium block mb-1">Other Taxonomy:</span>
                                    <p className="text-sm text-muted-foreground">{strain.otherTaxonomy}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FlaskConical className="h-5 w-5" />
                                Growth Characteristics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {strain.phosphates && <Badge variant="outline">Phosphates +</Badge>}
                                {strain.siderophores && <Badge variant="outline">Siderophores +</Badge>}
                                {strain.pigmentSecretion && <Badge variant="outline">Pigment +</Badge>}
                                {strain.amylase && <Badge variant="outline">Amylase {strain.amylase}</Badge>}
                                {strain.antibioticActivity && (
                                    <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                                        Antibiotic Activity
                                    </Badge>
                                )}
                            </div>
                            {strain.antibioticActivity && (
                                <div className="mt-4 text-sm">
                                    <span className="font-medium">Antibiotic Activity Details:</span>
                                    <p className="text-muted-foreground mt-1">{strain.antibioticActivity}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Dna className="h-5 w-5" />
                                Genetics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Sequenced:</span>
                                <Badge variant={strain.seq ? "default" : "secondary"}>
                                    {strain.seq ? "Yes" : "No"}
                                </Badge>
                            </div>
                            {strain.genome && (
                                <div>
                                    <span className="text-sm font-medium block mb-1">Genome:</span>
                                    <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                                        {strain.genome}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Additional Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            {strain.features && (
                                <div>
                                    <span className="font-medium block mb-1">Features:</span>
                                    <p className="text-muted-foreground">{strain.features}</p>
                                </div>
                            )}
                            {strain.comments && (
                                <div>
                                    <span className="font-medium block mb-1">Comments:</span>
                                    <p className="text-muted-foreground">{strain.comments}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-2 pt-4 border-t mt-4">
                                <span className="font-medium">Indexer:</span>
                                <span>{strain.indexerInitials || '-'}</span>
                                <span className="font-medium">RCAM:</span>
                                <span>{strain.collectionRcam || '-'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Beaker className="h-5 w-5" />
                                Media
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
                            <CardTitle className="flex items-center gap-2">
                                <Archive className="h-5 w-5" />
                                Storage Locations
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
                                            <div className="text-muted-foreground text-xs">Cell: {s.cell.cellCode}</div>
                                        </div>
                                        {s.isPrimary && <Badge variant="secondary" className="text-[10px]">Primary</Badge>}
                                    </button>
                                ))
                            ) : (
                                <p className="text-muted-foreground">Not allocated</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    )
}

export default function StrainDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    return (
        <Suspense fallback={<div className="p-8">Loading...</div>}>
            <StrainDetailContent id={id} />
        </Suspense>
    )
}
