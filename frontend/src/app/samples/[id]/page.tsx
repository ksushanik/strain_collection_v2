"use client"

import * as React from "react"
import { ApiService, Sample } from "@/services/api"
import { MainLayout } from "@/components/layout/main-layout"
import { Loader2, ArrowLeft, MapPin, Calendar, Leaf, Microscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface SampleWithStrains extends Sample {
    strains: Array<{
        id: number;
        identifier: string;
        seq: boolean;
        gramStain: string;
    }>;
    photos: any[];
}

export default function SampleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = React.use(params)
    const [sample, setSample] = React.useState<SampleWithStrains | null>(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        if (!id) return;
        ApiService.getSample(parseInt(id))
            .then((data: any) => {
                setSample(data)
                setLoading(false)
            })
            .catch(err => {
                console.error('Failed to load sample:', err)
                setLoading(false)
            })
    }, [id])

    if (loading) {
        return (
            <MainLayout>
                <div className="flex h-screen items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </MainLayout>
        )
    }

    if (!sample) {
        return (
            <MainLayout>
                <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold">Sample not found</h1>
                    <Button variant="link" onClick={() => router.back()}>Go back</Button>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="p-8 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{sample.code}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                            <Badge variant="outline">{sample.sampleType}</Badge>
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
                                    Collection Site
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">{sample.siteName}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Lat: {sample.lat}, Lng: {sample.lng}
                                        </p>
                                    </div>
                                </div>
                                {sample.description && (
                                    <div className="pt-4 border-t">
                                        <span className="text-sm font-medium block mb-1">Description:</span>
                                        <p className="text-muted-foreground">{sample.description}</p>
                                    </div>
                                )}

                                {/* Map Placeholder */}
                                <div className="h-64 bg-muted/30 rounded-md border flex items-center justify-center">
                                    <div className="text-center text-muted-foreground">
                                        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>Map View</p>
                                        <p className="text-xs">(Integration pending)</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Photos Placeholder */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Photos ({sample.photos?.length || 0})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-32 bg-muted/30 rounded-md border border-dashed flex items-center justify-center">
                                    <p className="text-sm text-muted-foreground">No photos uploaded</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Strains */}
                    <div className="space-y-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Microscope className="h-5 w-5" />
                                    Isolated Strains
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
                                                    {strain.seq && <Badge className="text-[10px] h-5">SEQ</Badge>}
                                                </div>
                                                <div className="flex gap-2 text-xs text-muted-foreground">
                                                    {strain.gramStain && (
                                                        <Badge variant="outline" className="text-[10px] h-5">
                                                            Gram {strain.gramStain === 'POSITIVE' ? '+' : '-'}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        No strains isolated yet
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
