"use client"

import * as React from "react"
import { MockApiService } from "@/services/mock-api"
import { Sample } from "@/types/domain"
import { Loader2 } from "lucide-react"

export function SampleList({ enabledPacks }: { enabledPacks: string[] }) {
    const [samples, setSamples] = React.useState<Sample[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        MockApiService.getSamples().then(data => {
            setSamples(data)
            setLoading(false)
        })
    }, [])

    if (loading) return <Loader2 className="h-6 w-6 animate-spin" />

    return (
        <div className="rounded-md border">
            <div className="p-4 bg-muted/50 border-b">
                <h3 className="font-semibold">Samples Grid</h3>
                <p className="text-xs text-muted-foreground">Enabled Packs: {enabledPacks.join(", ")}</p>
            </div>
            <div className="p-4">
                <pre className="text-xs overflow-auto max-h-[500px]">
                    {JSON.stringify(samples, null, 2)}
                </pre>
            </div>
        </div>
    )
}
