"use client"

import { SampleList } from "@/components/domain/sample-list"

export default function SamplesPage() {
    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Field Samples</h1>
                <p className="text-muted-foreground">Manage field samples and collection data.</p>
            </div>
            <SampleList />
        </div>
    )
}
