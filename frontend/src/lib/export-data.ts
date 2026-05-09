/**
 * Client-side data export utilities (CSV / JSON).
 * No external dependencies — works with Blob + URL.createObjectURL.
 */

export interface CsvColumn<T> {
  /** Header label shown in the first row */
  header: string
  /** Accessor – either a key of T or a function that extracts a string value */
  accessor: keyof T | ((row: T) => string | number | null | undefined)
}

/* ------------------------------------------------------------------ */
/*  CSV                                                                */
/* ------------------------------------------------------------------ */

function escapeCsvValue(value: unknown): string {
  if (value == null) return ""
  const str = String(value)
  // Wrap in quotes if the value contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function rowToCsv<T>(row: T, columns: CsvColumn<T>[]): string {
  return columns
    .map((col) => {
      const raw =
        typeof col.accessor === "function"
          ? col.accessor(row)
          : (row[col.accessor] as unknown)
      return escapeCsvValue(raw)
    })
    .join(",")
}

export function toCsvString<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => escapeCsvValue(c.header)).join(",")
  const body = rows.map((r) => rowToCsv(r, columns)).join("\n")
  return `${header}\n${body}`
}

/* ------------------------------------------------------------------ */
/*  Download helpers                                                    */
/* ------------------------------------------------------------------ */

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  // Cleanup
  setTimeout(() => {
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }, 100)
}

export function downloadCsv<T>(
  rows: T[],
  columns: CsvColumn<T>[],
  filename: string,
) {
  const csv = toCsvString(rows, columns)
  // BOM (\uFEFF) ensures Excel reads UTF-8 correctly
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
  downloadBlob(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`)
}

export function downloadJson(data: unknown, filename: string) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" })
  downloadBlob(blob, filename.endsWith(".json") ? filename : `${filename}.json`)
}

/* ------------------------------------------------------------------ */
/*  Format helpers for nested export data                              */
/* ------------------------------------------------------------------ */

/** Strip HTML tags and decode common entities — used for rich-text fields */
export function stripHtml(input: string | null | undefined): string {
  if (!input) return ""
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim()
}

/** ISO datetime → locale date string; empty for nullish */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return ""
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString()
}

/** ISO datetime → locale datetime string; empty for nullish */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return ""
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString()
}

interface PhenotypeLike {
  traitName?: string
  result?: string
  method?: string
  traitDefinition?: { code?: string; name?: string; units?: string | null } | null
}

/** Phenotypes → "Name=value (method); Name2=value2" */
export function joinPhenotypes(phenotypes: PhenotypeLike[] | undefined): string {
  if (!phenotypes || phenotypes.length === 0) return ""
  return phenotypes
    .map((p) => {
      const name = p.traitDefinition?.name || p.traitName || p.traitDefinition?.code || "?"
      const value = (p.result ?? "").trim() || "—"
      const units = p.traitDefinition?.units ? ` ${p.traitDefinition.units}` : ""
      const method = p.method ? ` (${p.method})` : ""
      return `${name}=${value}${units}${method}`
    })
    .join("; ")
}

interface StorageLike {
  isPrimary?: boolean
  cell?: { cellCode?: string; box?: { displayName?: string } }
}

/** Storage allocations → "Box1:A1*; Box2:B3" (* = primary) */
export function joinStorage(storage: StorageLike[] | undefined): string {
  if (!storage || storage.length === 0) return ""
  return storage
    .map((s) => {
      const box = s.cell?.box?.displayName ?? "?"
      const cell = s.cell?.cellCode ?? "?"
      const primary = s.isPrimary ? "*" : ""
      return `${box}:${cell}${primary}`
    })
    .join("; ")
}

interface MediaLike {
  notes?: string | null
  media?: { name?: string }
}

/** Linked media → "Medium A [notes]; Medium B" */
export function joinMedia(media: MediaLike[] | undefined): string {
  if (!media || media.length === 0) return ""
  return media
    .map((m) => {
      const name = m.media?.name ?? "?"
      const notes = m.notes ? ` [${m.notes}]` : ""
      return `${name}${notes}`
    })
    .join("; ")
}

interface PhotoLike {
  url?: string
  meta?: { originalName?: string } | null
}

/** Photos → "name1.jpg; name2.png" (or url tail if no original name) */
export function joinPhotos(photos: PhotoLike[] | undefined): string {
  if (!photos || photos.length === 0) return ""
  return photos
    .map((p) => p.meta?.originalName || p.url?.split("/").pop() || "")
    .filter(Boolean)
    .join("; ")
}

/** Strain identifiers attached to a sample → "Ott 1-23; Ott 2-23" */
export function joinStrainIdentifiers(
  strains: { identifier?: string }[] | undefined,
): string {
  if (!strains || strains.length === 0) return ""
  return strains.map((s) => s.identifier ?? "").filter(Boolean).join("; ")
}
