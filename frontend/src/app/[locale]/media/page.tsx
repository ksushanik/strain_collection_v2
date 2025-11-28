"use client"

import * as React from "react"
import { useRouter } from "@/i18n/routing"
import { ApiService, Media, PaginatedResponse } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, Search, Pencil, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"

const PAGE_SIZE = 10

export default function MediaPage() {
  const t = useTranslations('Media')
  const tCommon = useTranslations('Common')
  const router = useRouter()
  const [data, setData] = React.useState<PaginatedResponse<Media> | null>(null)
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [formData, setFormData] = React.useState<{ name: string; composition?: string }>({ name: "", composition: "" })
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const loadData = React.useCallback(() => {
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

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreate = () => {
    setFormData({ name: "", composition: "" })
    setEditingId(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (media: Media) => {
    setFormData({ name: media.name, composition: media.composition || "" })
    setEditingId(media.id)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    setSaving(true)
    try {
      if (editingId) {
        await ApiService.updateMedia(editingId, formData)
      } else {
        await ApiService.createMedia(formData)
      }
      setIsDialogOpen(false)
      loadData()
    } catch (err) {
      console.error("Failed to save media", err)
      setError("Save failed")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this media item?")) return
    setSaving(true)
    try {
      await ApiService.deleteMedia(id)
      loadData()
    } catch (err) {
      console.error("Failed to delete media", err)
      setError("Delete failed (possibly linked to strains)")
    } finally {
      setSaving(false)
    }
  }

  const filteredMedia = data?.data || []

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('addMedia')}
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-destructive">{error}</div>}

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tCommon('name')}</TableHead>
              <TableHead>{tCommon('description')}</TableHead>
              <TableHead className="w-[100px]">{tCommon('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredMedia.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No media found.
                </TableCell>
              </TableRow>
            ) : (
              filteredMedia.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.composition || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Media' : 'Add Media'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update media details.' : 'Create a new nutrient media.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="composition">Composition / Notes</Label>
                <Textarea
                  id="composition"
                  value={formData.composition || ""}
                  onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
