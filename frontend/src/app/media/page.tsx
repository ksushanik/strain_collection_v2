"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { ApiService, Media, PaginatedResponse } from "@/services/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Search, Trash2, Edit } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

const PAGE_SIZE = 10

export default function MediaPage() {
  const router = useRouter()
  const [data, setData] = React.useState<PaginatedResponse<Media> | null>(null)
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState<{ name: string; composition?: string }>({ name: "", composition: "" })
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setLoading(true)
    ApiService.getMedia({ search, page, limit: PAGE_SIZE })
      .then((res) => {
        setData(res)
        setError(null)
      })
      .catch((err) => {
        console.error("Failed to fetch media", err)
        setError("Failed to load media records")
      })
      .finally(() => setLoading(false))
  }, [search, page])

  const resetForm = () => {
    setForm({ name: "", composition: "" })
    setEditingId(null)
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (editingId) {
        await ApiService.updateMedia(editingId, form)
      } else {
        await ApiService.createMedia(form)
      }
      resetForm()
      const refreshed = await ApiService.getMedia({ search, page, limit: PAGE_SIZE })
      setData(refreshed)
    } catch (err) {
      console.error("Failed to save media", err)
      setError("Save failed")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (media: Media) => {
    setForm({ name: media.name, composition: media.composition })
    setEditingId(media.id)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this media item?")) return
    setSaving(true)
    try {
      await ApiService.deleteMedia(id)
      const refreshed = await ApiService.getMedia({
        search,
        page: Math.max(1, page),
        limit: PAGE_SIZE,
      })
      setData(refreshed)
    } catch (err) {
      console.error("Failed to delete media", err)
      setError("Delete failed (possibly linked to strains)")
    } finally {
      setSaving(false)
    }
  }

  const totalPages = data?.meta.totalPages ?? 1

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Media</h1>
            <p className="text-muted-foreground">Nutrient media reference</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.refresh()}>
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit media" : "New media"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Name (required)"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Textarea
              placeholder="Composition / notes"
              value={form.composition || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, composition: e.target.value }))}
            />
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={saving || !form.name.trim()}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                {editingId ? "Save" : "Add"}
              </Button>
              {editingId && (
                <Button variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Media list</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or composition"
                    className="pl-8 w-64"
                    value={search}
                    onChange={(e) => {
                      setPage(1)
                      setSearch(e.target.value)
                    }}
                  />
                </div>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Composition</TableHead>
                      <TableHead className="w-[120px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          {item.composition ? (
                            <div className="text-sm text-muted-foreground whitespace-pre-line">{item.composition}</div>
                          ) : (
                            <Badge variant="outline">No details</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(item.id)}
                            disabled={saving}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {data && data.data.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          No media found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
              <div>
                Page {page} of {totalPages || 1}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
