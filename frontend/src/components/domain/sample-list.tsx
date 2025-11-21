"use client"

import * as React from "react"
import { ApiService, Sample } from "@/services/api"
import { Loader2, MapPin, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function SampleList({ enabledPacks }: { enabledPacks: string[] }) {
    const router = useRouter()
    const [samples, setSamples] = React.useState<Sample[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        ApiService.getSamples().then(data => {
            setSamples(data)
            setLoading(false)
        }).catch(err => {
            console.error('Failed to load samples:', err)
            setLoading(false)
        })
    }, [])

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-end">
                <Button variant="outline" size="sm" className="mr-2">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                </Button>
                <Button size="sm" onClick={() => router.push('/samples/new')}>Create Sample</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {samples.map((sample) => (
                    <Link key={sample.id} href={`/samples/${sample.id}`} className="block">
                        <Card className="hover:shadow-md transition-shadow h-full">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{sample.code}</CardTitle>
                                        <CardDescription className="flex items-center gap-1 mt-1">
                                            <MapPin className="h-3 w-3" />
                                            {sample.siteName}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline">{sample.sampleType}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    {sample.description && (
                                        <p className="text-muted-foreground line-clamp-2">{sample.description}</p>
                                    )}
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>{new Date(sample.collectedAt).toLocaleDateString()}</span>
                                    </div>
                                    {sample._count && (
                                        <div className="flex gap-2 pt-2">
                                            <Badge variant="secondary" className="text-xs">
                                                {sample._count.strains} strains
                                            </Badge>
                                            <Badge variant="secondary" className="text-xs">
                                                {sample._count.photos} photos
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
