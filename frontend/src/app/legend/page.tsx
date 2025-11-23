"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { ApiService } from "@/services/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2, Save } from "lucide-react"

export default function LegendPage() {
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
      setMessage("Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Legend</h1>
          <p className="text-muted-foreground">Legend/help text for UI</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Legend editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  placeholder="Describe color codes, abbreviations, etc."
                />
                <div className="flex items-center gap-3">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save
                  </Button>
                  {message && <span className="text-sm text-muted-foreground">{message}</span>}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
