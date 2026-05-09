"use client"

import * as React from "react"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { TraitDataType, type Strain } from "@/services/api"
import { getTraitDisplayName, type TraitTranslations } from "@/lib/trait-labels"

type Phenotype = NonNullable<Strain["phenotypes"]>[number]

export const DEFAULT_PHENOTYPE_BADGE_CODES = [
    "siderophore_production",
    "pigment_secretion",
    "phosphate_solubilization",
    "amylase",
] as const

function getTraitCode(p: Phenotype | null | undefined) {
    return p?.traitCode || p?.traitDefinition?.code || null
}

function getTraitName(p: Phenotype | null | undefined) {
    return p?.traitDefinition?.name || p?.traitName || ""
}

function getDataType(p: Phenotype | null | undefined): TraitDataType {
    return p?.traitDefinition?.dataType ?? TraitDataType.TEXT
}

export type PhenotypeChip = { code: string; label: string; suffix?: string }

export function buildPhenotypeChips(
    phenotypes: Phenotype[] | null | undefined,
    t: TraitTranslations,
    codes: readonly string[] = DEFAULT_PHENOTYPE_BADGE_CODES,
): PhenotypeChip[] {
    const chips: PhenotypeChip[] = []
    const list = phenotypes ?? []

    for (const code of codes) {
        const p = list.find((it) => getTraitCode(it) === code)
        if (!p) continue

        const dataType = getDataType(p)
        const label = getTraitDisplayName(code, getTraitName(p), t)

        if (dataType === TraitDataType.BOOLEAN) {
            if (p.result !== "true") continue
            chips.push({ code, label, suffix: "+" })
            continue
        }

        if (dataType === TraitDataType.CATEGORICAL) {
            const result = String(p.result ?? "").trim()
            if (!result) continue
            const lower = result.toLowerCase()
            const suffix =
                lower === "+" || result.includes("+")
                    ? "+"
                    : lower === "-" || result.includes("-")
                        ? "-"
                        : result
            chips.push({ code, label, suffix })
        }
    }

    return chips
}

interface PhenotypeBadgesProps {
    phenotypes: Phenotype[] | null | undefined
    t: TraitTranslations
    codes?: readonly string[]
    variant?: BadgeProps["variant"]
    className?: string
}

export function PhenotypeBadges({
    phenotypes,
    t,
    codes,
    variant = "outline",
    className,
}: PhenotypeBadgesProps) {
    const chips = React.useMemo(
        () => buildPhenotypeChips(phenotypes, t, codes),
        [phenotypes, t, codes],
    )

    if (chips.length === 0) return null

    return (
        <>
            {chips.map((c) => (
                <Badge
                    key={`${c.code}-${c.suffix ?? ""}`}
                    variant={variant}
                    className={className}
                >
                    {c.label}
                    {c.suffix ? ` ${c.suffix}` : ""}
                </Badge>
            ))}
        </>
    )
}
