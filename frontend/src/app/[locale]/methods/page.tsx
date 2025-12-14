"use client"

import * as React from "react"
import { ApiService, Method, PaginatedResponse } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, Search, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { RichTextDisplay } from "@/components/ui/rich-text-display"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

export default function MethodsPage() {
  const t = useTranslations("Methods")
  const tCommon = useTranslations("Common")
  const { user } = useAuth()
  const nameInputRef = React.useRef<HTMLInputElement>(null)
  const [data, setData] = React.useState<PaginatedResponse<Method> | null>(null)
  const [search, setSearch] = React.useState("")
  const [page] = React.useState(1)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [formData, setFormData] = React.useState<{ name: string; description?: string }>({ name: "", description: "" })
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const canDelete = user && (user.role === "ADMIN" || user.role === "MANAGER")

  const loadData = React.useCallback(() => {
    setLoading(true)
    ApiService.getMethods({ search, page, limit: PAGE_SIZE })
      .then((res) => {
        setData(res)
        setError(null)
      })
      .catch((err) => {
        const message = typeof (err as { message?: unknown })?.message === "string"
          ? (err as { message: string }).message
          : t("failedToLoad")
        console.error("Failed to fetch methods", err)
        setError(message)
      })
      .finally(() => setLoading(false))
  }, [page, search, t])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreate = () => {
    setFormData({ name: "", description: "" })
    setEditingId(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (method: Method) => {
    setFormData({ name: method.name, description: method.description || "" })
    setEditingId(method.id)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const currentName = nameInputRef.current?.value ?? formData.name
    if (!currentName.trim()) return
    setSaving(true)
    try {
      const payload = { ...formData, name: currentName }
      if (editingId) {
        await ApiService.updateMethod(editingId, payload)
      } else {
        await ApiService.createMethod(payload)
      }
      setIsDialogOpen(false)
      loadData()
    } catch (err) {
      console.error("Failed to save method", err)
      setError(t("failedToSave"))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm(t("deleteConfirm"))) return
    setSaving(true)
    try {
      await ApiService.deleteMethod(id)
      loadData()
    } catch (err) {
      console.error("Failed to delete method", err)
      setError(t("failedToDelete"))
    } finally {
      setSaving(false)
    }
  }

  const methods = data?.data || []

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        {user && (
          <Button onClick={handleCreate} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            {t("addMethod")}
          </Button>
        )}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-destructive">{error}</div>}

      <div className="grid gap-4 md:hidden">
        {loading ? (
          <Card>
            <CardContent className="py-6 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : methods.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground">{t("empty")}</CardContent>
          </Card>
        ) : (
          methods.map((item) => (
            <Card
              key={item.id}
              onClick={user ? () => handleEdit(item) : undefined}
              className={cn(user && "cursor-pointer hover:bg-muted/30")}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{item.name}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {item.description ? <RichTextDisplay content={item.description} className="text-sm" /> : "-"}
                </div>
              </CardHeader>
              {canDelete && (
                <CardContent className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(item.id)
                    }}
                    className="flex-1 min-w-[120px]"
                  >
                    <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                    {tCommon("delete")}
                  </Button>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      <div className="hidden rounded-md border bg-white md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tCommon("name")}</TableHead>
              <TableHead>{tCommon("description")}</TableHead>
              {canDelete && <TableHead className="w-[70px]">{tCommon("actions")}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={canDelete ? 3 : 2} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : methods.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canDelete ? 3 : 2} className="h-24 text-center text-muted-foreground">
                  {t("empty")}
                </TableCell>
              </TableRow>
            ) : (
              methods.map((item) => (
                <TableRow
                  key={item.id}
                  onClick={user ? () => handleEdit(item) : undefined}
                  className={cn(user && "cursor-pointer hover:bg-muted/30")}
                >
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    {item.description ? <RichTextDisplay content={item.description} className="text-sm" /> : "-"}
                  </TableCell>
                  {canDelete && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} aria-label={tCommon("delete")}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? t("editTitle") : t("addTitle")}</DialogTitle>
            <DialogDescription>{editingId ? t("editSubtitle") : t("addSubtitle")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{tCommon("name")}</Label>
                <Input
                  id="name"
                  ref={nameInputRef}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>{tCommon("description")}</Label>
                <RichTextEditor
                  value={formData.description || ""}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder={t("descriptionPlaceholder")}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
