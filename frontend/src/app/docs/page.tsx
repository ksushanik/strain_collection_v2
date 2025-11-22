import fs from "fs/promises"
import path from "path"
import React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type DocMeta = {
  id: string
  title: string
  file: string
}

const DOCS: DocMeta[] = [
  { id: "index", title: "Index", file: "index.md" },
  { id: "architecture", title: "Architecture & Overview", file: "architecture.md" },
  { id: "backend", title: "Backend (NestJS/Prisma)", file: "backend.md" },
  { id: "frontend", title: "Frontend (Next.js)", file: "frontend.md" },
  { id: "api", title: "API & Auth", file: "api.md" },
  { id: "storage", title: "Storage", file: "storage.md" },
  { id: "media", title: "Media", file: "media.md" },
  { id: "legend", title: "Legend", file: "legend.md" },
  { id: "testing", title: "Testing", file: "testing.md" },
  { id: "playbooks", title: "Playbooks", file: "playbooks.md" },
  { id: "changelog", title: "Changelog", file: "changelog.md" },
  { id: "contrib", title: "Wiki Contribution Guide", file: "contrib.md" },
]

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean)
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
    return <span key={`t-${idx}`}>{part}</span>
  })
}

function renderLinkAware(text: string) {
  const linkRegex = /(\[[^\]]+\]\([^)]+\))/g
  const segments = text.split(linkRegex).filter(Boolean)

  return segments.map((seg, idx) => {
    const match = seg.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (match) {
      const [, label, hrefRaw] = match
      const isMd = hrefRaw.endsWith(".md")
      const anchor = isMd ? `#${hrefRaw.replace(/\.md$/, "")}` : hrefRaw
      return (
        <a
          key={`link-${idx}`}
          href={anchor}
          className="text-primary underline underline-offset-4"
        >
          {renderInline(label)}
        </a>
      )
    }
    return <React.Fragment key={`seg-${idx}`}>{renderInline(seg)}</React.Fragment>
  })
}

function renderMarkdown(md: string) {
  const lines = md.split(/\r?\n/)
  const elements: React.ReactNode[] = []
  let listBuffer: string[] = []
  let paragraph: string[] = []

  const flushParagraph = () => {
    if (paragraph.length) {
      elements.push(
        <p key={`p-${elements.length}`} className="leading-relaxed">
          {renderLinkAware(paragraph.join(" "))}
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
            <li key={`li-${elements.length}-${idx}`}>{renderLinkAware(item)}</li>
          ))}
        </ul>
      )
      listBuffer = []
    }
  }

  lines.forEach((line) => {
    const trimmed = line.trim()
    if (trimmed === "") {
      flushParagraph()
      flushList()
      return
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/)
    if (headingMatch) {
      flushParagraph()
      flushList()
      const level = headingMatch[1].length
      const text = headingMatch[2]
      const Tag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements
      elements.push(
        <Tag key={`h-${elements.length}`} className="scroll-m-20 text-lg font-semibold first:mt-0">
          {renderLinkAware(text)}
        </Tag>
      )
      return
    }

    if (trimmed.startsWith("- ")) {
      listBuffer.push(trimmed.slice(2))
      return
    }

    paragraph.push(trimmed)
  })

  flushParagraph()
  flushList()

  return <div className="prose prose-sm max-w-none">{elements}</div>
}

async function loadDoc(file: string) {
  const filePath = path.resolve(process.cwd(), "..", "docs", "wiki", file)
  const content = await fs.readFile(filePath, "utf-8").catch(() => "")
  return content
}

export default async function DocsPage() {
  const docsWithContent = await Promise.all(
    DOCS.map(async (doc) => ({
      ...doc,
      content: await loadDoc(doc.file),
    }))
  )

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Wiki</h1>
            <p className="text-muted-foreground">
              Актуальная база знаний проекта (Markdown из docs/wiki).
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {docsWithContent.map((doc) => (
            <Card key={doc.id} id={doc.id}>
              <CardHeader>
                <CardTitle>{doc.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {doc.content ? (
                  renderMarkdown(doc.content)
                ) : (
                  <p className="text-sm text-muted-foreground">Файл не найден или пуст: {doc.file}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}
