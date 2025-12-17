"use client"

import * as React from "react"
import { CommandEmpty, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import type { GlobalSearchResponse, SearchHit, SearchSection as SectionKey } from "@/types/api"

import { SearchSection } from "@/components/domain/global-search/search-section"

type SearchResultsPanelProps = {
  query: string
  isLoading: boolean
  mode: "preview" | "full"
  results: GlobalSearchResponse | null
  sectionHeadings: Record<SectionKey, string>
  messages: {
    startTyping: string
    loading: string
    noResults: (query: string) => string
    showAll: string
  }
  onSelectHit: (hit: SearchHit) => void
  onShowAll: () => void
}

export function SearchResultsPanel({
  query,
  isLoading,
  mode,
  results,
  sectionHeadings,
  messages,
  onSelectHit,
  onShowAll,
}: SearchResultsPanelProps) {
  const trimmed = query.trim()

  const totalHits = React.useMemo(() => {
    if (!results) return 0
    return (Object.keys(results.sections) as SectionKey[]).reduce(
      (sum, key) => sum + (results.sections[key]?.length ?? 0),
      0
    )
  }, [results])

  return (
    <CommandList>
      {trimmed.length < 2 ? (
        <CommandEmpty>{messages.startTyping}</CommandEmpty>
      ) : isLoading ? (
        <CommandEmpty>{messages.loading}</CommandEmpty>
      ) : totalHits === 0 ? (
        <CommandEmpty>{messages.noResults(trimmed)}</CommandEmpty>
      ) : null}

      {trimmed.length >= 2 && !isLoading && results && totalHits > 0 ? (
        <>
          {mode === "preview" ? (
            <>
              <CommandItem onSelect={onShowAll} value="show-all">
                {messages.showAll}
              </CommandItem>
              <CommandSeparator />
            </>
          ) : null}

          {(Object.keys(sectionHeadings) as SectionKey[]).map((key) => (
            <SearchSection
              key={key}
              heading={sectionHeadings[key]}
              hits={results.sections[key] ?? []}
              sectionLabel={sectionHeadings[key]}
              onSelectHit={onSelectHit}
            />
          ))}
        </>
      ) : null}
    </CommandList>
  )
}
