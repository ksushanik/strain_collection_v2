"use client"

import * as React from "react"
import { ApiService } from "@/services/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Button } from "@/components/ui/button"
import { Loader2, Save } from "lucide-react"
import { useTranslations } from "next-intl"

export default function LegendPage() {
  const t = useTranslations('Legend')
  const [content, setContent] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    ApiService.getLegend()
      .then((res) => setContent(res?.content || ""))
      .catch((err) => {
        console.error("Failed to fetch legend", err)
        setMessage("Failed to load legend")
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await ApiService.updateLegend(content)
      setMessage("Saved")
    } catch (err) {
      console.error("Failed to save legend", err)
      setMessage("Failed to save legend")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {t('saveChanges')}
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${message === "Saved" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('content')}</CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            value={content}
            onChange={(value) => setContent(value)}
            placeholder={t('placeholder')}
          />
        </CardContent>
      </Card>
    </div>
  )
}
