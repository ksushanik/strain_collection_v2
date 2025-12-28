"use client"

import * as React from "react"
import { ApiService } from "@/services/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Plus, Save, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useAuth } from "@/contexts/AuthContext"
import { canRead, hasPermission } from "@/lib/permissions"
import { AccessDenied } from "@/components/common/access-denied"

export default function LegendPage() {
  const t = useTranslations('Legend')
  const { user, isLoading: authLoading } = useAuth()
  const [rows, setRows] = React.useState<{ id: number; index: string; fullName: string }[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null)

  const canReadPage = canRead(user, "Legend")
  const canUpdate = hasPermission(user, "Legend", "update")

  React.useEffect(() => {
    if (!canReadPage) {
      setLoading(false)
      return
    }
    setLoading(true)
    ApiService.getIndexers()
      .then((res) => setRows(res.map((item) => ({ id: item.id, index: item.index, fullName: item.fullName }))))
      .catch((err) => {
        console.error("Failed to fetch indexers", err)
        setMessage({ type: "error", text: t("loadError") })
      })
      .finally(() => setLoading(false))
  }, [canReadPage])

  const handleAddRow = () => {
    setRows((prev) => [...prev, { id: Date.now() * -1, index: "", fullName: "" }])
  }

  const handleDeleteRow = (id: number) => {
    setRows((prev) => prev.filter((row) => row.id !== id))
  }

  const handleFieldChange = (id: number, field: "index" | "fullName", value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const trimmed = rows.map((row) => ({
        index: row.index.trim(),
        fullName: row.fullName.trim(),
      }))
      const nonEmpty = trimmed.filter((row) => row.index || row.fullName)

      for (const row of nonEmpty) {
        if (!row.index) {
          setMessage({ type: "error", text: t("indexRequired") })
          setSaving(false)
          return
        }
        if (!row.fullName) {
          setMessage({ type: "error", text: t("fullNameRequired") })
          setSaving(false)
          return
        }
      }

      const seen = new Set<string>()
      for (const row of nonEmpty) {
        if (seen.has(row.index)) {
          setMessage({ type: "error", text: t("indexUnique") })
          setSaving(false)
          return
        }
        seen.add(row.index)
      }

      await ApiService.updateIndexers(nonEmpty)
      setMessage({ type: "success", text: t("saveSuccess") })
    } catch (err) {
      console.error("Failed to save indexers", err)
      setMessage({ type: "error", text: t("saveError") })
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!canReadPage) {
    return <AccessDenied />
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          {canUpdate && (
            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {t('saveChanges')}
            </Button>
          )}
      </div>

      {message && (
        <div className={`p-4 rounded-md ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t('indexersTitle')}</CardTitle>
            {canUpdate && (
              <Button type="button" variant="outline" onClick={handleAddRow} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                {t("addRow")}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">{t("index")}</TableHead>
                <TableHead>{t("fullName")}</TableHead>
                {canUpdate && <TableHead className="w-[1%]" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canUpdate ? 3 : 2} className="h-20 text-center text-muted-foreground">
                    {t("empty")}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Input
                        value={row.index}
                        onChange={(event) => handleFieldChange(row.id, "index", event.target.value)}
                        placeholder={t("indexPlaceholder")}
                        disabled={!canUpdate}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.fullName}
                        onChange={(event) => handleFieldChange(row.id, "fullName", event.target.value)}
                        placeholder={t("fullNamePlaceholder")}
                        disabled={!canUpdate}
                      />
                    </TableCell>
                    {canUpdate && (
                      <TableCell className="text-right">
                        <Button type="button" variant="ghost" onClick={() => handleDeleteRow(row.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
