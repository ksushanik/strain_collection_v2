"use client"

import * as React from "react"
import { ApiService, Strain } from "@/services/api"
import { Loader2, Box as BoxIcon, X, Check, Edit2, Trash2, Save, Search, Filter, Plus } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useRouter, usePathname } from "@/i18n/routing"
import { useSearchParams } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useApiError } from "@/hooks/use-api-error"
import { useTranslations } from "next-intl"
import { useAuth } from "@/contexts/AuthContext"
import { formatSampleCodeForDisplay } from "@/lib/sample-code"
type BoxSummary = {
  id: number;
  displayName: string;
  rows: number;
  cols: number;
  description?: string;
  _count?: { cells: number };
  occupiedCells?: number;
  freeCells?: number;
}

type BoxDetail = {
  id: number;
  displayName: string;
  rows: number;
  cols: number;
  description?: string;
  cells: {
    id: number;
    row: number;
    col: number;
    cellCode: string;
    status: 'FREE' | 'OCCUPIED';
    strain?: { isPrimary?: boolean; strain?: { id: number; identifier: string; seq: boolean } } | null;
  }[];
}

const STORAGE_SORT_BY_VALUES = ["displayName", "createdAt"] as const
type StorageSortBy = (typeof STORAGE_SORT_BY_VALUES)[number]
type SortOrder = "asc" | "desc"

function isStorageSortBy(value: unknown): value is StorageSortBy {
  return typeof value === "string" && (STORAGE_SORT_BY_VALUES as readonly string[]).includes(value)
}

function isSortOrder(value: unknown): value is SortOrder {
  return value === "asc" || value === "desc"
}

function readSortPreference(key: string): { sortBy: StorageSortBy; sortOrder: SortOrder } | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object") return null

    const sortBy = (parsed as { sortBy?: unknown }).sortBy
    const sortOrder = (parsed as { sortOrder?: unknown }).sortOrder

    if (!isStorageSortBy(sortBy) || !isSortOrder(sortOrder)) return null
    return { sortBy, sortOrder }
  } catch {
    return null
  }
}

export function StorageView({ legendText }: { legendText?: string | null }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { handleError } = useApiError()
  const t = useTranslations('Storage')
  const tCommon = useTranslations('Common')
  const { user, isLoading: authLoading } = useAuth()
  const [boxes, setBoxes] = React.useState<BoxSummary[]>([])
  const [selectedBoxId, setSelectedBoxId] = React.useState<number | null>(null)
  const [selectedBox, setSelectedBox] = React.useState<BoxDetail | null>(null)
  const [selectedCellCode, setSelectedCellCode] = React.useState<string | null>(null)
  const [pendingHighlight, setPendingHighlight] = React.useState<{ boxId?: number; cell?: string } | null>(null)
  const [strains, setStrains] = React.useState<Strain[]>([])
  const [allocating, setAllocating] = React.useState(false)
  const [allocForm, setAllocForm] = React.useState<{ strainId?: number; isPrimary?: boolean }>({})
  const [loading, setLoading] = React.useState(true)
  const [loadingBox, setLoadingBox] = React.useState(false)
  const [creating, setCreating] = React.useState(false)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const sortStorageKey = "storageView.boxSort"
  const [sortBy, setSortBy] = React.useState<StorageSortBy>(() => readSortPreference(sortStorageKey)?.sortBy ?? "createdAt")
  const [sortOrder, setSortOrder] = React.useState<SortOrder>(() => readSortPreference(sortStorageKey)?.sortOrder ?? "desc")
  const [search, setSearch] = React.useState("")
  const [filtersOpen, setFiltersOpen] = React.useState(false)
  const [onlyWithFreeCells, setOnlyWithFreeCells] = React.useState(false)
  const [boxForm, setBoxForm] = React.useState<{ displayName: string; rows: number; cols: number; description?: string }>({
    displayName: "",
    rows: 9,
    cols: 9,
    description: "",
  })
  const [editingBox, setEditingBox] = React.useState(false)
  const [editForm, setEditForm] = React.useState<{ displayName: string; description: string }>({ displayName: '', description: '' })
  const [updatingBox, setUpdatingBox] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(sortStorageKey, JSON.stringify({ sortBy, sortOrder }))
  }, [sortBy, sortOrder, sortStorageKey])

  React.useEffect(() => {
    if (selectedBox) {
      setEditForm({ displayName: selectedBox.displayName, description: selectedBox.description || '' })
    }
  }, [selectedBox])

  async function handleUpdateBox() {
    if (!selectedBoxId || !editForm.displayName.trim()) return
    setUpdatingBox(true)
    try {
      await ApiService.updateStorageBox(selectedBoxId, {
        displayName: editForm.displayName,
        description: editForm.description
      })
      const updated = await ApiService.getBoxCells(selectedBoxId)
      setSelectedBox(updated)
      setEditingBox(false)
      setBoxes(prev => prev.map(b => b.id === selectedBoxId ? { ...b, displayName: updated.displayName, description: updated.description } : b))
      await loadBoxes()
    } catch (err) {
      handleError(err, t('failedToUpdateBox'))
    } finally {
      setUpdatingBox(false)
    }
  }

  async function handleDeleteBox() {
    if (!selectedBoxId || !confirm(t('deleteConfirm'))) return
    try {
      await ApiService.deleteStorageBox(selectedBoxId)
      setBoxes(prev => prev.filter(b => b.id !== selectedBoxId))
      setSelectedBoxId(null)
    } catch (err: unknown) {
      handleError(err, t('failedToDeleteBox'))
    }
  }

  const loadBoxes = React.useCallback(() => {
    setLoading(true)
    return ApiService.getStorageBoxes({ sortBy, sortOrder })
      .then((data) => {
        setBoxes(data)
        setLoading(false)
      })
      .catch((err) => {
        handleError(err, t('failedToLoadBoxes'))
        setLoading(false)
      })
  }, [handleError, sortBy, sortOrder, t])

  // Fetch Boxes
  React.useEffect(() => {
    if (authLoading) return
    loadBoxes()
  }, [authLoading, user, loadBoxes])

  // Fetch strains for allocation
  React.useEffect(() => {
    if (authLoading) return
    ApiService.getStrains({ limit: 500 })
      .then(res => setStrains(res.data))
      .catch(err => handleError(err, t('failedToLoadStrains')))
  }, [authLoading, user, handleError, t])

  // Fetch Box details when selection changes
  React.useEffect(() => {
    if (!selectedBoxId) return
    setLoadingBox(true)
    ApiService.getBoxCells(selectedBoxId).then(box => {
      setSelectedBox(box)
      setSelectedCellCode(null)
      setLoadingBox(false)
    }).catch(err => {
      handleError(err, t('failedToLoadCells'))
      setLoadingBox(false)
    })
  }, [selectedBoxId, handleError, t])

  const selectedCell = selectedBox?.cells.find(c => c.cellCode === selectedCellCode) || null

  const visibleBoxes = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return boxes.filter((b) => {
      if (onlyWithFreeCells && typeof b.freeCells === 'number' && b.freeCells <= 0) {
        return false
      }
      if (!q) return true
      const hay = `${b.displayName} ${b.description ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [boxes, onlyWithFreeCells, search])

  // Apply highlight from query params (?boxId=&cell=) when data is ready
  React.useEffect(() => {
    if (boxes.length === 0) return
    const boxIdParam = searchParams?.get("boxId")
    const cellParam = searchParams?.get("cell")
    if (!boxIdParam && !cellParam) return

    const parsedBoxId = boxIdParam ? Number(boxIdParam) : undefined
    const validBoxId = parsedBoxId && Number.isFinite(parsedBoxId) ? parsedBoxId : undefined
    if (validBoxId && boxes.some((b) => b.id === validBoxId)) {
      setSelectedBoxId(validBoxId)
    }

    setPendingHighlight({ boxId: validBoxId, cell: cellParam || undefined })
  }, [boxes, searchParams])

  React.useEffect(() => {
    if (!selectedBox || !pendingHighlight) return
    if (pendingHighlight.boxId && selectedBox.id !== pendingHighlight.boxId) return

    if (pendingHighlight.cell) {
      const match = selectedBox.cells.find(
        (c) => c.cellCode.toLowerCase() === pendingHighlight.cell!.toLowerCase()
      )
      if (match) {
        setSelectedCellCode(match.cellCode)
      }
    }

    setPendingHighlight(null)
  }, [pendingHighlight, selectedBox])

  React.useEffect(() => {
    if (selectedCell?.status === 'OCCUPIED' && selectedCell.strain?.strain?.id) {
      setAllocForm({
        strainId: selectedCell.strain.strain.id,
        isPrimary: selectedCell.strain.isPrimary ?? false,
      });
    } else if (selectedCell?.status === 'FREE') {
      setAllocForm({ strainId: undefined, isPrimary: false });
    }
  }, [selectedCell]);

  async function handleAllocate() {
    if (!selectedBoxId || !selectedCellCode || !allocForm.strainId) return
    setAllocating(true)
    try {
      await ApiService.allocateCell(selectedBoxId, selectedCellCode, {
        strainId: allocForm.strainId,
        isPrimary: allocForm.isPrimary,
      })
      const box = await ApiService.getBoxCells(selectedBoxId)
      setSelectedBox(box)
      setSelectedCellCode(selectedCellCode)
      updateBoxListState(box)
    } catch (err) {
      handleError(err, t('failedToAllocate'))
    } finally {
      setAllocating(false)
    }
  }

  async function handleCreateBox() {
    if (!boxForm.displayName.trim()) return
    setCreating(true)
    try {
      const created = await ApiService.createStorageBox({
        displayName: boxForm.displayName,
        rows: boxForm.rows,
        cols: boxForm.cols,
        description: boxForm.description,
      })
      await loadBoxes()
      setSelectedBoxId(created.id)
      setBoxForm({ displayName: "", rows: 9, cols: 9, description: "" })
      setCreateDialogOpen(false)
    } catch (err) {
      handleError(err, t('failedToCreateBox'))
    } finally {
      setCreating(false)
    }
  }

  async function handleUnallocate() {
    if (!selectedBoxId || !selectedCellCode) return
    setAllocating(true)
    try {
      await ApiService.unallocateCell(selectedBoxId, selectedCellCode)
      const box = await ApiService.getBoxCells(selectedBoxId)
      setSelectedBox(box)
      setSelectedCellCode(null)
      updateBoxListState(box)
    } catch (err) {
      handleError(err, t('failedToUnallocate'))
    } finally {
      setAllocating(false)
    }
  }

  function updateBoxListState(updatedBox: BoxDetail) {
    const occupiedCount = updatedBox.cells.filter(c => c.status === 'OCCUPIED').length
    setBoxes(prev => prev.map(b => {
      if (b.id === updatedBox.id) {
        return {
          ...b,
          occupiedCells: occupiedCount,
          // Update _count if needed, though usually total cells don't change
          _count: b._count ? { ...b._count, cells: updatedBox.rows * updatedBox.cols } : undefined
        }
      }
      return b
    }))
  }

  if (loading && boxes.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }



  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="relative flex-1 min-w-[220px] sm:max-w-sm">
          {loading ? (
            <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          )}
          <Input
            placeholder={t('searchPlaceholder')}
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{t('sort')}</span>
            <select
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as StorageSortBy)}
            >
              <option value="displayName">{t('byName')}</option>
              <option value="createdAt">{t('byCreatedDate')}</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            >
              {sortOrder === 'asc' ? t('ascSort') : t('descSort')}
            </Button>
          </div>

          <Button
            variant={filtersOpen ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {t('filters')}
          </Button>

          {user && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('createBox')}
            </Button>
          )}
        </div>
      </div>

      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          if (!open && !creating) {
            setBoxForm({ displayName: "", rows: 9, cols: 9, description: "" })
          }
          setCreateDialogOpen(open)
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t('createBox')}</DialogTitle>
            <DialogDescription>{t('rowsColsRule')}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                placeholder={t('displayNamePlaceholder')}
                value={boxForm.displayName}
                onChange={(e) => setBoxForm({ ...boxForm, displayName: e.target.value })}
              />
            </div>
            <Select
              value={boxForm.rows.toString()}
              onValueChange={(val) => setBoxForm({ ...boxForm, rows: parseInt(val) })}
            >
              <SelectTrigger><SelectValue placeholder={t('rows')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="9">{t('rows9')}</SelectItem>
                <SelectItem value="10">{t('rows10')}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={boxForm.cols.toString()}
              onValueChange={(val) => setBoxForm({ ...boxForm, cols: parseInt(val) })}
            >
              <SelectTrigger><SelectValue placeholder={t('cols')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="9">{t('cols9')}</SelectItem>
                <SelectItem value="10">{t('cols10')}</SelectItem>
              </SelectContent>
            </Select>
            <div className="sm:col-span-2">
              <Input
                placeholder={t('descriptionPlaceholder')}
                value={boxForm.description}
                onChange={(e) => setBoxForm({ ...boxForm, description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={creating}
            >
              {tCommon('cancel')}
            </Button>
            <Button onClick={handleCreateBox} disabled={creating || !boxForm.displayName.trim()}>
              {creating && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {tCommon('create')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {filtersOpen && (
        <Card className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="onlyWithFreeCells"
              checked={onlyWithFreeCells}
              onCheckedChange={(checked) => setOnlyWithFreeCells(checked === true)}
            />
            <label htmlFor="onlyWithFreeCells" className="text-sm">
              {t('onlyWithFreeCells')}
            </label>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOnlyWithFreeCells(false)}
            >
              {tCommon('reset')}
            </Button>
          </div>
        </Card>
      )}

      {/* Box Selection */}
      {boxes.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground border rounded-lg border-dashed">
          {t('noBoxes')}
        </div>
      ) : (
        <div>
          {visibleBoxes.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground border rounded-lg border-dashed">
              {t('noResults')}
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {visibleBoxes.map(box => (
              <Button
                key={box.id}
                variant={selectedBoxId === box.id ? "default" : "outline"}
                onClick={() => setSelectedBoxId(box.id)}
              >
                <div className="flex items-center w-full">
                  <BoxIcon className="mr-2 h-5 w-5 shrink-0" />
                  <span className="font-semibold truncate" title={box.displayName}>{box.displayName}</span>
                </div>
                {
                  box._count && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "w-full justify-center mt-2 transition-colors",
                        selectedBoxId === box.id
                          ? "bg-white text-foreground border border-border shadow-sm"
                          : "bg-muted text-muted-foreground",
                        "group-hover:bg-white group-hover:text-foreground"
                      )}
                    >
                      {box.occupiedCells !== undefined
                        ? `${box.occupiedCells}/${box._count.cells}`
                        : `${box._count.cells}`} {tCommon('cells')}
                    </Badge>
                )
              }
            </Button>
          ))}
          </div>
          )}
        </div>
      )}

      {/* Box Details Modal */}
      <Dialog open={!!selectedBoxId} onOpenChange={(open) => !open && setSelectedBoxId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between mr-8 h-9">
              {editingBox ? (
                <div className="flex items-center gap-2 w-full">
                  <Input
                    value={editForm.displayName}
                    onChange={e => setEditForm({ ...editForm, displayName: e.target.value })}
                    className="h-8"
                    placeholder={t('displayNamePlaceholder')}
                  />
                  <Button size="sm" onClick={handleUpdateBox} disabled={updatingBox}>
                    {updatingBox ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingBox(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span>{selectedBox?.displayName || t('loading')}</span>
                    {selectedBox && (
                      <>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingBox(true)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={handleDeleteBox}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                  {selectedBox && (
                    <span className="text-sm font-normal text-muted-foreground">
                      Grid: {selectedBox.rows} × {selectedBox.cols}
                    </span>
                  )}
                </>
              )}
            </DialogTitle>
            {!editingBox && selectedBox?.description && (
              <DialogDescription>{selectedBox.description}</DialogDescription>
            )}
            {editingBox && (
              <Input
                value={editForm.description}
                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                placeholder={t('descriptionPlaceholder')}
                className="mt-2 h-8"
              />
            )}
            {legendText && (
              <DialogDescription className="mt-2 whitespace-pre-line text-xs text-muted-foreground border-t pt-2">
                {legendText}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="mt-4">
            {loadingBox ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : selectedBox ? (
              <>
                <div
                  className="grid mx-auto w-full max-w-3xl p-2"
                  style={{
                    gridTemplateColumns: `repeat(${selectedBox.cols}, 42px)`,
                    gap: '8px 10px',
                    justifyContent: 'center'
                  }}
                >
                  {selectedBox.cells?.map((cell) => {
                    const isOccupied = cell.status === 'OCCUPIED'
                    const strainId = cell.strain?.strain?.identifier

                    return (
                      <div
                        key={cell.id}
                        className={cn(
                          "h-10 w-10 flex items-center justify-center rounded-md border text-[11px] font-semibold cursor-pointer transition-colors hover:ring-2 hover:ring-ring hover:ring-offset-0",
                          isOccupied
                            ? "bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400"
                            : "bg-muted/30 border-muted-foreground/30 text-muted-foreground hover:bg-muted/60",
                          selectedCellCode === cell.cellCode && "ring-2 ring-primary"
                        )}
                        title={isOccupied ? `${t('strain')}: ${strainId}` : `${t('empty')} ${cell.cellCode}`}
                        onClick={() => setSelectedCellCode(cell.cellCode)}
                      >
                        {isOccupied ? (
                          <span className="truncate px-0.5 text-[8px]">{strainId?.split('-').pop()}</span>
                        ) : (
                          <span className="text-muted-foreground/30 text-[8px]">{cell.cellCode}</span>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground justify-center">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded border bg-background" />
                    <span>{t('free')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded border border-green-300 bg-green-100 dark:bg-green-900/30 dark:border-green-800" />
                    <span>{t('occupied')}</span>
                  </div>
                </div>

                {selectedCell && (
                  <div className="mt-6 rounded border p-4 bg-muted/10">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('cell')}</p>
                        <p className="text-lg font-semibold">{selectedCell.cellCode}</p>
                      </div>
                      <Badge variant={selectedCell.status === 'OCCUPIED' ? "secondary" : "outline"}>
                        {selectedCell.status === 'OCCUPIED' ? t('occupied') : t('free')}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {selectedCell.status === 'OCCUPIED' ? t('reassignStrain') : t('assignStrain')}
                        </p>
                        <Select
                          value={allocForm.strainId ? allocForm.strainId.toString() : undefined}
                          onValueChange={(val) =>
                            setAllocForm((prev) => ({ ...prev, strainId: parseInt(val) }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectStrain')} />
                          </SelectTrigger>
                          <SelectContent>
                            {strains.map((s) => (
                              <SelectItem key={s.id} value={s.id.toString()}>
                                {s.identifier} {s.sample?.code ? `(${formatSampleCodeForDisplay(s.sample.code)})` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isPrimary"
                          checked={allocForm.isPrimary ?? false}
                          onCheckedChange={(checked) =>
                            setAllocForm((prev) => ({ ...prev, isPrimary: checked === true }))
                          }
                        />
                        <label htmlFor="isPrimary" className="text-sm leading-none">
                          {t('primaryAllocation')}
                        </label>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {selectedCell.status === 'OCCUPIED' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              const returnTo = pathname || '/strains';
                              const targetId = selectedCell.strain?.strain?.id;
                              if (targetId) {
                                router.push(`/strains/${targetId}?returnTo=${encodeURIComponent(returnTo)}`);
                              }
                            }}
                          >
                            <Check className="h-4 w-4 mr-1" /> {t('openStrain')}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCellCode(null);
                            setAllocForm({ strainId: undefined, isPrimary: false });
                          }}
                        >
                          <X className="h-4 w-4 mr-1" /> {t('deselect')}
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleAllocate}
                          disabled={!allocForm.strainId || allocating}
                        >
                          {allocating ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 mr-1" />
                          )}
                          {selectedCell.status === 'OCCUPIED' ? t('reassign') : t('allocate')}
                        </Button>
                        {selectedCell.status === 'OCCUPIED' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleUnallocate}
                            disabled={allocating}
                          >
                            {allocating && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                            {t('unallocate')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div >
  )
}
