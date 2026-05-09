"use client"

import * as React from "react"
import { Download, Loader2, CheckCircle2, XCircle, AlertTriangle, FilePlus, FileEdit, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { ImportReport } from "@/services/api"
import { useApiError } from "@/hooks/use-api-error"

interface ImportButtonProps {
  /** Server function: validate without writing. */
  dryRun: (file: File) => Promise<ImportReport>
  /** Server function: actually write the data. */
  commit: (file: File) => Promise<ImportReport>
  /** Optional callback fired after a successful commit (e.g. reload list). */
  onCompleted?: (report: ImportReport) => void
  /**
   * Note about which columns are silently ignored at import. Shown above the
   * preview table so users understand why some data is not reflected after
   * commit. Empty string disables the note.
   */
  ignoredColumnsNote?: string
}

type Step = "idle" | "validating" | "preview" | "committing" | "completed"

const ACCEPTED_MIME = "text/csv,application/vnd.ms-excel,text/plain,.csv"

export function ImportButton({
  dryRun,
  commit,
  onCompleted,
  ignoredColumnsNote,
}: ImportButtonProps) {
  const t = useTranslations("Common")
  const { handleError } = useApiError()
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState<Step>("idle")
  const [file, setFile] = React.useState<File | null>(null)
  const [report, setReport] = React.useState<ImportReport | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const reset = React.useCallback(() => {
    setStep("idle")
    setFile(null)
    setReport(null)
  }, [])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      // Closing the dialog mid-flight is fine — the in-flight request will
      // simply discard its result on completion.
      reset()
    }
    setOpen(next)
  }

  const handleFile = async (selected: File) => {
    setFile(selected)
    setStep("validating")
    try {
      const r = await dryRun(selected)
      setReport(r)
      setStep("preview")
    } catch (err) {
      handleError(err, t("importValidationFailed"))
      reset()
    }
  }

  const handleConfirm = async () => {
    if (!file) return
    setStep("committing")
    try {
      const r = await commit(file)
      setReport(r)
      setStep("completed")
      onCompleted?.(r)
      const { toCreate, toUpdate, errors } = r.summary
      if (errors === 0) {
        toast.success(
          t("importCompletedOk", { created: toCreate, updated: toUpdate }),
        )
      } else {
        toast.warning(
          t("importCompletedWithErrors", {
            created: toCreate,
            updated: toUpdate,
            errors,
          }),
        )
      }
    } catch (err) {
      handleError(err, t("importCommitFailed"))
      // Fall back to preview step so user can review and retry.
      setStep("preview")
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Download className="mr-2 h-4 w-4" />
        {t("import")}
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("importTitle")}</DialogTitle>
            <DialogDescription>
              {step === "idle" || step === "validating"
                ? t("importSelectFileHint")
                : step === "preview"
                  ? t("importPreviewHint")
                  : step === "committing"
                    ? t("importCommittingHint")
                    : t("importCompletedHint")}
            </DialogDescription>
          </DialogHeader>

          {(step === "idle" || step === "validating") && (
            <div className="flex flex-col items-center gap-4 py-6">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_MIME}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleFile(f)
                  // Reset so re-selecting the same file fires onChange
                  e.target.value = ""
                }}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={step === "validating"}
                size="lg"
              >
                {step === "validating" ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Download className="mr-2 h-5 w-5" />
                )}
                {step === "validating" ? t("importValidating") : t("importSelectFile")}
              </Button>
              {file && step === "validating" && (
                <p className="text-sm text-muted-foreground">{file.name}</p>
              )}
            </div>
          )}

          {(step === "preview" || step === "completed") && report && (
            <ImportReportView
              report={report}
              ignoredColumnsNote={
                step === "preview" ? ignoredColumnsNote : undefined
              }
              isFinal={step === "completed"}
            />
          )}

          {step === "committing" && (
            <div className="flex items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              {t("importCommittingHint")}
            </div>
          )}

          <DialogFooter className="flex flex-row justify-between sm:justify-between gap-2">
            {step === "preview" && (
              <>
                <Button variant="ghost" onClick={reset}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("importBack")}
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!report || report.summary.toCreate + report.summary.toUpdate === 0}
                >
                  {t("importConfirm", {
                    count: (report?.summary.toCreate ?? 0) + (report?.summary.toUpdate ?? 0),
                  })}
                </Button>
              </>
            )}
            {step === "completed" && (
              <Button className="ml-auto" onClick={() => handleOpenChange(false)}>
                {t("importDone")}
              </Button>
            )}
            {(step === "idle" || step === "validating") && (
              <Button
                className="ml-auto"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                disabled={step === "validating"}
              >
                {t("cancel")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface ImportReportViewProps {
  report: ImportReport
  ignoredColumnsNote?: string
  isFinal: boolean
}

function ImportReportView({ report, ignoredColumnsNote, isFinal }: ImportReportViewProps) {
  const t = useTranslations("Common")
  const errorRows = report.rows.filter((r) => r.status === "error")
  const successRows = report.rows.filter((r) => r.status !== "error")

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <SummaryCard
          icon={<FilePlus className="h-4 w-4" />}
          label={t("importCreate")}
          value={report.summary.toCreate}
          tone="success"
        />
        <SummaryCard
          icon={<FileEdit className="h-4 w-4" />}
          label={t("importUpdate")}
          value={report.summary.toUpdate}
          tone="info"
        />
        <SummaryCard
          icon={<XCircle className="h-4 w-4" />}
          label={t("importErrors")}
          value={report.summary.errors}
          tone={report.summary.errors > 0 ? "danger" : "muted"}
        />
        <SummaryCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label={t("importTotal")}
          value={report.summary.total}
          tone="muted"
        />
      </div>

      {ignoredColumnsNote && (
        <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{ignoredColumnsNote}</span>
        </div>
      )}

      {errorRows.length > 0 && (
        <div className="rounded-md border max-h-56 overflow-y-auto">
          <div className="text-xs font-medium px-3 py-2 border-b bg-muted/50">
            {t("importErrorsHeading", { count: errorRows.length })}
          </div>
          <ul className="text-xs divide-y">
            {errorRows.map((r) => (
              <li key={r.rowNum} className="px-3 py-2">
                <span className="font-medium">
                  {t("importRowLabel", { row: r.rowNum })}
                  {r.identifier ? ` · ${r.identifier}` : ""}
                </span>
                <ul className="ml-4 mt-1 list-disc text-muted-foreground">
                  {r.errors.map((e, i) => (
                    <li key={i}>
                      {e.field ? <span className="font-medium">{e.field}: </span> : null}
                      {e.message}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isFinal && successRows.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {t("importSuccessRowsHint", { count: successRows.length })}
        </div>
      )}
    </div>
  )
}

interface SummaryCardProps {
  icon: React.ReactNode
  label: string
  value: number
  tone: "success" | "info" | "danger" | "muted"
}

function SummaryCard({ icon, label, value, tone }: SummaryCardProps) {
  return (
    <div
      className={cn(
        "rounded-md border p-3 flex items-start gap-2",
        tone === "success" && "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30",
        tone === "info" && "border-sky-300 bg-sky-50 dark:border-sky-700 dark:bg-sky-950/30",
        tone === "danger" && "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30",
        tone === "muted" && "bg-muted/30",
      )}
    >
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
      </div>
    </div>
  )
}
