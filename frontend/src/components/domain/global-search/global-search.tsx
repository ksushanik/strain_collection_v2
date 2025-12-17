"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "@/i18n/routing"
import { ApiService } from "@/services/api"
import { useDebounce } from "@/hooks/use-debounce"
import type { GlobalSearchResponse, SearchHit, SearchSection } from "@/types/api"
import { SearchCommand } from "@/components/domain/global-search/search-command"
import { SearchResultsPanel } from "@/components/domain/global-search/search-results-panel"
import { useTranslations } from "next-intl"

type GlobalSearchProps = {
  trigger?: "button" | "icon"
}

export function GlobalSearch({ trigger = "button" }: GlobalSearchProps) {
  const tNav = useTranslations("Navigation")
  const tSearch = useTranslations("GlobalSearch")
  const tCommon = useTranslations("Common")
  const router = useRouter()

  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [mode, setMode] = React.useState<"preview" | "full">("preview")
  const [results, setResults] = React.useState<GlobalSearchResponse | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const requestIdRef = React.useRef(0)

  const debouncedQuery = useDebounce(query, 300)

  React.useEffect(() => {
    setMode("preview")
  }, [debouncedQuery])

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  React.useEffect(() => {
    if (!open) return

    const q = debouncedQuery.trim()
    if (q.length < 2) {
      setResults(null)
      setIsLoading(false)
      return
    }

    const controller = new AbortController()
    const requestId = ++requestIdRef.current
    setIsLoading(true)

    ApiService.searchGlobal({
      query: q,
      mode,
      perSection: mode === "preview" ? 3 : 10,
      signal: controller.signal,
    })
      .then((res) => {
        if (requestIdRef.current !== requestId) return
        setResults(res)
      })
      .catch((err) => {
        if (err?.name === "AbortError") return
        if (requestIdRef.current !== requestId) return
        console.error("Global search failed", err)
        setResults(null)
      })
      .finally(() => {
        if (requestIdRef.current !== requestId) return
        setIsLoading(false)
      })

    return () => controller.abort()
  }, [debouncedQuery, mode, open])

  const sectionHeadings = React.useMemo(() => {
    return {
      strains: tNav("strains"),
      samples: tNav("samples"),
      storage: tNav("storage"),
      media: tNav("media"),
      methods: tNav("methods"),
      legend: tNav("legend"),
      wiki: tNav("wiki"),
    } satisfies Record<SearchSection, string>
  }, [tNav])

  const handleSelectHit = (hit: SearchHit) => {
    setOpen(false)
    setQuery("")
    setResults(null)
    router.push(hit.href)
  }

  const handleShowAll = () => {
    setMode("full")
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setQuery("")
      setMode("preview")
      setResults(null)
      setIsLoading(false)
    }
  }

  const Trigger = (
    <Button
      type="button"
      variant={trigger === "icon" ? "ghost" : "outline"}
      size={trigger === "icon" ? "icon" : "sm"}
      onClick={() => setOpen(true)}
      className={trigger === "button" ? "w-full max-w-sm justify-start gap-2 text-muted-foreground" : undefined}
    >
      <Search className="h-4 w-4" />
      {trigger === "button" ? (
        <span className="flex-1 text-left">{tSearch("placeholder")}</span>
      ) : null}
      {trigger === "button" ? (
        <span className="ml-auto hidden text-xs text-muted-foreground/70 sm:inline">
          {tSearch("shortcut")}
        </span>
      ) : null}
    </Button>
  )

  return (
    <>
      {Trigger}
      <SearchCommand
        open={open}
        onOpenChange={handleOpenChange}
        title={tCommon("search")}
        query={query}
        onQueryChange={setQuery}
        placeholder={tSearch("placeholder")}
      >
        <SearchResultsPanel
          query={query}
          isLoading={isLoading}
          mode={mode}
          results={results}
          sectionHeadings={sectionHeadings}
          messages={{
            startTyping: tSearch("startTyping"),
            loading: tSearch("loading"),
            noResults: (q) => tSearch("noResults", { query: q }),
            showAll: tSearch("showAll"),
          }}
          onSelectHit={handleSelectHit}
          onShowAll={handleShowAll}
        />
      </SearchCommand>
    </>
  )
}
