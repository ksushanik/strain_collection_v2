"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { StrainForm } from "@/components/domain/strain-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiService, Strain } from "@/services/api"
import { Loader2 } from "lucide-react"

export default function EditStrainPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const [strain, setStrain] = React.useState<Strain | null>(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        ApiService.getStrain(parseInt(id))
            .then(setStrain)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [id])

    if (loading) {
        return (
            <MainLayout>
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </MainLayout>
        )
    }

    if (!strain) {
        return (
            <MainLayout>
                <div className="p-8 text-center text-muted-foreground">
                    Strain not found
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="p-8 max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Edit Strain</h1>
                    <p className="text-muted-foreground">
                        Update strain details.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Strain Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StrainForm initialData={strain} isEdit />
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}
