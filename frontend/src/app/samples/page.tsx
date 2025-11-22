"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { SampleList } from "@/components/domain/sample-list"

export default function SamplesPage() {
    return (
        <MainLayout>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Samples</h1>
                    <p className="text-muted-foreground">
                        Browse and manage environmental samples.
                    </p>
                </div>
                <SampleList />
            </div>
        </MainLayout>
    )
}
