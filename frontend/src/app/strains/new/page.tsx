"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { StrainForm } from "@/components/domain/strain-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CreateStrainPage() {
    return (
        <MainLayout>
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
                        <StrainForm />
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}
