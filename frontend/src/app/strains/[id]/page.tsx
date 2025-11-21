"use client"

import * as React from "react"
import { ApiService, Strain } from "@/services/api"
import { MainLayout } from "@/components/layout/main-layout"
import { Loader2, ArrowLeft, Microscope, Dna, FlaskConical, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function StrainDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = React.use(params)
    const [strain, setStrain] = React.useState<Strain | null>(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        if (!id) return;
        ApiService.getStrain(parseInt(id))
            .then(data => {
                setStrain(data)
                setLoading(false)
            })
            .catch(err => {
                console.error('Failed to load strain:', err)
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
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{strain.identifier}</h1>
                        <p className="text-muted-foreground">
                            Sample: {strain.sample?.code || 'Unknown'} • ID: {strain.id}
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
                    {/* Taxonomy */}
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
                                    <span>{strain.taxonomy16s.genus}</span>
                                    <span className="font-medium">Species:</span>
                                    <span>{strain.taxonomy16s.species}</span>
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

                    {/* Growth Characteristics */}
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

                    {/* Genetics */}
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

                    {/* Additional Info */}
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
                </div>
            </div>
        </MainLayout>
    )
}
