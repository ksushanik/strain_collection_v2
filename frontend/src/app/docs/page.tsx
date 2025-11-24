"use client"

import React from "react"
import { Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type IndexedDoc = {
  id: string
  title: string
  file: string
  content: string
  text: string
  headings: { level: number; text: string }[]
}

export default function DocsPage() {
  const [docs, setDocs] = React.useState<IndexedDoc[]>([])
  const [query, setQuery] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/wiki-api/docs-index")
        if (!res.ok) throw new Error(`Failed to load docs index: ${res.statusText}`)
        const data = (await res.json()) as IndexedDoc[]
        setDocs(data)
      } catch (e: any) {
        setError(e?.message || "Не удалось загрузить wiki")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return docs
    return docs.filter((d) => d.text.includes(q) || d.title.toLowerCase().includes(q))
  }, [query, docs])

  return (
    <div className="p-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Wiki</h1>
            <p className="text-muted-foreground">
              Markdown из docs/wiki (volume), поиск по тексту.
            </p>
          </div>
          <div className="w-full sm:w-80">
            <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                className="flex-1 bg-transparent text-sm outline-none"
                placeholder="Поиск по тексту..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Загрузка wiki...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {!loading && !error && (
          <div className="grid gap-4">
            {filtered.map((doc) => (
              <Card key={doc.id} id={doc.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle>{doc.title}</CardTitle>
                    {doc.headings.length > 0 && (
                      <div className="text-xs text-muted-foreground space-y-1 max-w-xs">
                        <div className="font-semibold text-foreground">Содержание</div>
                        <div className="space-y-1">
                          {doc.headings.slice(0, 6).map((h, idx) => (
                            <div
                              key={`${doc.id}-h-${idx}`}
                              className="truncate"
                              style={{ paddingLeft: (h.level - 1) * 8 }}
                            >
                              • {h.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {doc.content ? (
                    renderMarkdown(doc.content)
                  ) : (
                    <p className="text-sm text-muted-foreground">Файл не найден: {doc.file}</p>
                  )}
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground">Ничего не найдено по запросу “{query}”</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g).filter(Boolean)
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`b-${idx}`} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`code-${idx}`}
          className="rounded bg-muted px-1 py-0.5 text-xs font-mono"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (linkMatch) {
      const [, label, href] = linkMatch
      const isExternal = href.startsWith("http")
      const anchor = href.endsWith(".md") ? `#${href.replace(/\.md$/, "")}` : href
      return (
        <a
          key={`link-${idx}`}
          href={anchor}
          className="text-primary underline underline-offset-4"
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer" : undefined}
        >
          {label}
        </a>
      )
    }
    return <span key={`t-${idx}`}>{part}</span>
  })
}

function renderMarkdown(md: string) {
  const lines = md.split(/\r?\n/)
  const elements: React.ReactNode[] = []
  let listBuffer: string[] = []
  let orderedListBuffer: string[] = []
  let paragraph: string[] = []
  let codeBlock: string[] | null = null

  const flushParagraph = () => {
    if (paragraph.length) {
      elements.push(
        <p key={`p-${elements.length}`} className="leading-relaxed">
          {renderInline(paragraph.join(" "))}
        </p>
      )
      paragraph = []
    }
  }

  const flushList = () => {
    if (listBuffer.length) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc pl-6 space-y-1">
          {listBuffer.map((item, idx) => (
            <li key={`li-${elements.length}-${idx}`}>{renderInline(item)}</li>
          ))}
        </ul>
      )
      listBuffer = []
    }
  }

  const flushOrderedList = () => {
    if (orderedListBuffer.length) {
      elements.push(
        <ol key={`ol-${elements.length}`} className="list-decimal pl-6 space-y-1">
          {orderedListBuffer.map((item, idx) => (
            <li key={`oli-${elements.length}-${idx}`}>{renderInline(item)}</li>
          ))}
        </ol>
      )
      orderedListBuffer = []
    }
  }

  lines.forEach((line) => {
    if (line.startsWith("```")) {
      if (codeBlock) {
        elements.push(
          <pre key={`code-${elements.length}`} className="rounded bg-muted p-3 text-xs overflow-x-auto">
            <code>{codeBlock.join("\n")}</code>
          </pre>
        )
        codeBlock = null
      } else {
        codeBlock = []
      }
      return
    }

    if (codeBlock) {
      codeBlock.push(line)
      return
    }

    const trimmed = line.trim()
    if (trimmed === "") {
      flushParagraph()
      flushList()
      flushOrderedList()
      return
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/)
    if (headingMatch) {
      flushParagraph()
      flushList()
      flushOrderedList()
      const level = headingMatch[1].length
      const text = headingMatch[2]
      const Tag = `h${Math.min(level, 6)}` as keyof React.JSX.IntrinsicElements
      elements.push(
        <Tag key={`h-${elements.length}`} className="scroll-m-20 text-lg font-semibold first:mt-0">
          {renderInline(text)}
        </Tag>
      )
      return
    }

    if (trimmed.startsWith("- ")) {
      listBuffer.push(trimmed.slice(2))
      return
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/)
    if (orderedMatch) {
      orderedListBuffer.push(orderedMatch[1])
      return
    }

    paragraph.push(trimmed)
  })

  flushParagraph()
  flushList()
  flushOrderedList()

  return <div className="prose prose-sm max-w-none">{elements}</div>
}
