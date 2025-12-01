import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

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
  { id: "audit", title: "Audit Log", file: "audit.md" },
  { id: "contrib", title: "Wiki Contribution Guide", file: "contrib.md" },
]

const wikiBasePath = process.env.WIKI_PATH || path.join(process.cwd(), "../docs/wiki")

function renderInlineText(text: string) {
  return text.replace(/(\*\*|`|\[[^\]]+\]\([^)]+\))/g, " ")
}

function extractHeadings(md: string) {
  return md
    .split(/\r?\n/)
    .map((line) => line.match(/^(#{1,6})\s+(.*)$/))
    .filter(Boolean)
    .map((m) => ({ level: m![1].length, text: renderInlineText(m![2]) }))
}

export async function GET() {
  try {
    const docsWithContent = await Promise.all(
      DOCS.map(async (doc) => {
        const filePath = path.resolve(wikiBasePath, doc.file)
        const content = await fs.readFile(filePath, "utf-8").catch(() => "")
        const text = content.toLowerCase()
        const headings = extractHeadings(content)
        return { ...doc, content, text, headings }
      }),
    )
    return NextResponse.json(docsWithContent)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load wiki"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
