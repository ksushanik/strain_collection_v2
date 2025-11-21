"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { SampleForm } from "@/components/domain/sample-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CreateSamplePage() {
    return (
        <MainLayout>
            <div className="p-8 max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Create New Sample</h1>
                    <p className="text-muted-foreground">
                        Register a new environmental sample.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Sample Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SampleForm />
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}
