"use client"

import * as React from "react"
import { ApiService, UiBinding } from "@/services/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, ArrowUp, ArrowDown, Save, Shield } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

type EditableBinding = UiBinding & { enabledFieldPacks: string[] }

export default function SettingsPage() {
  const { user } = useAuth()
  const [bindings, setBindings] = React.useState<EditableBinding[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    ApiService.getUiBindings()
      .then((data) => {
        setBindings(
          (data || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) as EditableBinding[]
        )
        setMessage(null)
      })
      .catch((err) => {
        console.error("Failed to load ui bindings", err)
        setMessage("Failed to load settings")
      })
      .finally(() => setLoading(false))
  }, [])

  const updateBinding = (index: number, patch: Partial<EditableBinding>) => {
    setBindings((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], ...patch }
      return copy
    })
  }

  const handleReorder = (index: number, direction: "up" | "down") => {
    setBindings((prev) => {
      const copy = [...prev]
      const targetIndex = direction === "up" ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= copy.length) return prev
      const temp = copy[targetIndex]
      copy[targetIndex] = copy[index]
      copy[index] = temp
      return copy.map((item, i) => ({ ...item, order: i }))
    })
  }

  const handleAdd = () => {
    setBindings((prev) => [
      ...prev,
      {
        id: Date.now(),
        menuLabel: "New section",
        profileKey: "SAMPLE",
        icon: "Box",
        routeSlug: `section-${prev.length + 1}`,
        enabledFieldPacks: [],
        order: prev.length,
        legendId: null,
        legend: null,
      },
    ])
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await ApiService.updateUiBindings(
        bindings.map((b, index) => ({
          ...b,
          order: index,
        })) as UiBinding[]
      )
      setMessage("Saved")
    } catch (err) {
      console.error("Failed to save ui bindings", err)
      setMessage("Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">UI bindings: order, labels, icons</p>
          </div>
          <Button variant="outline" onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add section
          </Button>
        </div>

        {user?.role === 'ADMIN' && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Panel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Open AdminJS without re-login (single sign-on)
                </p>
                <Button
                  variant="default"
                  onClick={async () => {
                    try {
                      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'
                      const data = await ApiService.startAdminSso()
                      if (data?.nonce) {
                        window.location.href = `${base}/api/v1/admin-sso/sso/complete?nonce=${encodeURIComponent(data.nonce)}`
                      }
                    } catch (e) {
                      console.error('SSO failed', e)
                    }
                  }}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Open AdminJS
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Menu sections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                {bindings.map((binding, index) => (
                  <div key={binding.id} className="rounded border p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">#{index + 1}</Badge>
                        <Input
                          className="w-48"
                          value={binding.menuLabel}
                          onChange={(e) => updateBinding(index, { menuLabel: e.target.value })}
                          placeholder="Label"
                        />
                        <Input
                          className="w-32"
                          value={binding.profileKey}
                          onChange={(e) => updateBinding(index, { profileKey: e.target.value.toUpperCase() })}
                          placeholder="PROFILE"
                        />
                        <Input
                          className="w-32"
                          value={binding.icon}
                          onChange={(e) => updateBinding(index, { icon: e.target.value })}
                          placeholder="Icon (e.g. Box)"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleReorder(index, "up")}
                          disabled={index === 0}
                          title="Up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleReorder(index, "down")}
                          disabled={index === bindings.length - 1}
                          title="Down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setBindings((prev) => prev.filter((_, i) => i !== index))}
                          title="Remove section"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        className="w-64"
                        value={binding.routeSlug}
                        onChange={(e) => updateBinding(index, { routeSlug: e.target.value })}
                        placeholder="route-slug"
                      />
                      <Input
                        className="flex-1"
                        value={binding.enabledFieldPacks.join(",")}
                        onChange={(e) => updateBinding(index, { enabledFieldPacks: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                        placeholder="enabled field packs (comma separated)"
                      />
                      <Textarea
                        className="w-64"
                        rows={2}
                        value={binding.legend?.content || ""}
                        onChange={(e) =>
                          updateBinding(
                            index,
                            binding.legendId != null
                              ? { legend: { id: binding.legendId, content: e.target.value }, legendId: binding.legendId }
                              : { legend: null, legendId: null }
                          )
                        }
                        placeholder="Legend override (optional)"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">{message}</div>
              <Button onClick={handleSave} disabled={saving || loading}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save order and labels
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
