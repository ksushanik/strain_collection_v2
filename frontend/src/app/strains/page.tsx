"use client"

import { StrainList } from "@/components/domain/strain-list"

export default function StrainsPage() {
    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Strains</h1>
                <p className="text-muted-foreground">
                    Browse and manage strains in the collection.
                </p>
            </div>
            <StrainList enabledPacks={["taxonomy", "growth_characteristics"]} />
        </div>
    )
}
