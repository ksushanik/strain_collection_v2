"use client"

import { Suspense } from "react"
import { StrainForm } from "@/components/domain/strain-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSearchParams } from "next/navigation"

function CreateStrainPageContent() {
    const searchParams = useSearchParams()
    const returnTo = searchParams?.get("returnTo") || undefined

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Create New Strain</h1>
                <p className="text-muted-foreground">
                    Register a new bacterial strain in the collection.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Strain Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <StrainForm returnTo={returnTo} />
                </CardContent>
            </Card>
        </div>
    )
}

export default function CreateStrainPage() {
    return (
        <Suspense fallback={<div className="p-8">Loading...</div>}>
            <CreateStrainPageContent />
        </Suspense>
    )
}
