"use client"

import * as React from "react"

import { SampleForm } from "@/components/domain/sample-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiService, Sample } from "@/services/api"
import { Loader2 } from "lucide-react"
import { PhotoUpload } from "@/components/domain/photo-upload"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "@/i18n/routing"

export default function EditSamplePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const [sample, setSample] = React.useState<Sample | null>(null)
    const [loading, setLoading] = React.useState(true)
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()

    React.useEffect(() => {
        if (!authLoading && user && user.role !== 'ADMIN' && user.role !== 'MANAGER') {
            router.push('/samples') // Redirect unauthorized users
        }
    }, [user, authLoading, router])

    React.useEffect(() => {
        ApiService.getSample(parseInt(id))
            .then(setSample)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [id])

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!sample) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Sample not found
            </div>
        )
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Edit Sample</h1>
                <p className="text-muted-foreground">
                    Update sample details.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Sample Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <SampleForm initialData={sample} isEdit />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Sample Photos</CardTitle>
                </CardHeader>
                <CardContent>
                    <PhotoUpload
                        sampleId={sample.id}
                        existingPhotos={sample.photos || []}
                        onPhotosChange={() => ApiService.getSample(sample.id).then(setSample).catch(console.error)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
