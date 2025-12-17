"use client"

import * as React from "react"
import { CommandItem } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import type { SearchHit } from "@/types/api"
import { cn } from "@/lib/utils"

type SearchHitItemProps = {
  hit: SearchHit
  sectionLabel: string
  onSelect: (hit: SearchHit) => void
}

export function SearchHitItem({ hit, sectionLabel, onSelect }: SearchHitItemProps) {
  return (
    <CommandItem
      value={`${hit.title} ${hit.snippet ?? ""}`.trim()}
      className="items-start"
      onSelect={() => onSelect(hit)}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate font-medium">{hit.title}</span>
          <Badge variant="secondary" className={cn("shrink-0", "rounded-md px-2 py-0.5")}>
            {sectionLabel}
          </Badge>
        </div>
        {hit.snippet ? (
          <span className="line-clamp-2 text-xs text-muted-foreground">
            {hit.snippet}
          </span>
        ) : null}
      </div>
    </CommandItem>
  )
}
