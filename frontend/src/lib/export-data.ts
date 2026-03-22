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
