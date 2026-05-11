"use client"

import * as React from "react"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { TraitDataType, type Strain } from "@/services/api"
import { getTraitDisplayName, type TraitTranslations } from "@/lib/trait-labels"
import { stripHtml } from "@/lib/export-data"

type Phenotype = NonNullable<Strain["phenotypes"]>[number]

export const DEFAULT_PHENOTYPE_BADGE_CODES = [
    "siderophore_production",
    "pigment_secretion",
    "phosphate_solubilization",
    "amylase",
] as const

const TEXT_VALUE_MAX_LENGTH = 60

function getTraitCode(p: Phenotype | null | undefined) {
    return p?.traitCode || p?.traitDefinition?.code || null
}

function getTraitName(p: Phenotype | null | undefined) {
    return p?.traitDefinition?.name || p?.traitName || ""
}

function getDataType(p: Phenotype | null | undefined): TraitDataType {
    return p?.traitDefinition?.dataType ?? TraitDataType.TEXT
}

function getUnits(p: Phenotype | null | undefined): string | null {
    const units = p?.traitDefinition?.units
    return typeof units === "string" && units.trim() ? units.trim() : null
}

function truncateValue(value: string): string {
    return value.length > TEXT_VALUE_MAX_LENGTH
        ? `${value.slice(0, TEXT_VALUE_MAX_LENGTH)}…`
        : value
}

export type PhenotypeChip = { code: string; label: string; suffix?: string; value?: string }

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
            if (p.result === "true") {
                chips.push({ code, label, suffix: "+" })
            } else if (p.result === "false") {
                chips.push({ code, label, suffix: "-" })
            }
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
            continue
        }

        // TEXT and NUMERIC: render as "Label: value" with HTML stripped and truncated.
        const cleaned = stripHtml(String(p.result ?? ""))
        if (!cleaned) continue
        const units = getUnits(p)
        const withUnits = units ? `${cleaned} ${units}` : cleaned
        chips.push({ code, label, value: truncateValue(withUnits) })
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
                    key={`${c.code}-${c.suffix ?? c.value ?? ""}`}
                    variant={variant}
                    className={className}
                >
                    {c.label}
                    {c.value !== undefined
                        ? `: ${c.value}`
                        : c.suffix
                            ? ` ${c.suffix}`
                            : ""}
                </Badge>
            ))}
        </>
    )
}
