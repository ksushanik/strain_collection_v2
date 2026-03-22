"use client"

import * as React from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CsvColumn, downloadCsv, downloadJson } from "@/lib/export-data"
import { useTranslations } from "next-intl"

interface ExportButtonProps<T> {
  /** Async function that fetches ALL rows matching current filters */
  fetchData: () => Promise<T[]>
  /** Column definitions for CSV export */
  columns: CsvColumn<T>[]
  /** Filename prefix, e.g. "strains" → "strains-2026-03-22.csv" */
  filenamePrefix: string
}

function dateSuffix() {
  return new Date().toISOString().slice(0, 10)
}

export function ExportButton<T>({
  fetchData,
  columns,
  filenamePrefix,
}: ExportButtonProps<T>) {
  const t = useTranslations("Common")
  const [loading, setLoading] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  const handleExport = async (format: "csv" | "json") => {
    setLoading(true)
    setOpen(false)
    try {
      const data = await fetchData()
      const filename = `${filenamePrefix}-${dateSuffix()}`
      if (format === "csv") {
        downloadCsv(data, columns, filename)
      } else {
        downloadJson(data, filename)
      }
    } catch {
      // Error is already handled by ApiService (toast via handleError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {loading ? t("exporting") : t("export")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-2" align="start">
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="justify-start"
            onClick={() => handleExport("csv")}
          >
            {t("exportCsv")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start"
            onClick={() => handleExport("json")}
          >
            {t("exportJson")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
