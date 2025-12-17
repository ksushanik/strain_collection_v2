"use client"

import * as React from "react"
import { CommandGroup } from "@/components/ui/command"
import type { SearchHit } from "@/types/api"
import { SearchHitItem } from "@/components/domain/global-search/search-hit-item"

type SearchSectionProps = {
  heading: string
  hits: SearchHit[]
  sectionLabel: string
  onSelectHit: (hit: SearchHit) => void
}

export function SearchSection({ heading, hits, sectionLabel, onSelectHit }: SearchSectionProps) {
  if (hits.length === 0) return null

  return (
    <CommandGroup heading={heading}>
      {hits.map((hit) => (
        <SearchHitItem
          key={`${hit.section}:${hit.id}`}
          hit={hit}
          sectionLabel={sectionLabel}
          onSelect={onSelectHit}
        />
      ))}
    </CommandGroup>
  )
}
