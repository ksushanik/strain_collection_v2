"use client"

import * as React from "react"
import { ApiService, Strain } from "@/services/api"
import { Loader2, Box as BoxIcon, Plus, X, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

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
    strain?: { strain?: { id: number; identifier: string; seq: boolean } } | null;
  }[];
}

export function StorageView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
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
  const [boxForm, setBoxForm] = React.useState<{ displayName: string; rows: number; cols: number; description?: string }>({
    displayName: "",
    rows: 9,
    cols: 9,
    description: "",
  })

  // Fetch Boxes on mount
  React.useEffect(() => {
    ApiService.getStorageBoxes().then(data => {
      setBoxes(data)
      if (data.length > 0) setSelectedBoxId(data[0].id)
      setLoading(false)
    }).catch(err => {
      console.error('Failed to load boxes:', err)
      setLoading(false)
    })
    ApiService.getStrains({ limit: 500 })
      .then(res => setStrains(res.data))
      .catch(err => console.error('Failed to load strains for allocation', err))
  }, [])

  // Fetch Box details when selection changes
  React.useEffect(() => {
    if (!selectedBoxId) return
    setLoadingBox(true)
    ApiService.getBoxCells(selectedBoxId).then(box => {
      setSelectedBox(box)
      setSelectedCellCode(null)
      setLoadingBox(false)
    }).catch(err => {
      console.error('Failed to load box:', err)
      setLoadingBox(false)
    })
  }, [selectedBoxId])

  const selectedCell = selectedBox?.cells.find(c => c.cellCode === selectedCellCode) || null

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
        isPrimary: (selectedCell.strain as any)?.isPrimary ?? false,
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
    } catch (err) {
      console.error('Allocate failed', err)
    } finally {
      setAllocating(false)
    }
  }

  async function handleCreateBox() {
    if (!boxForm.displayName.trim()) return
    setCreating(true)
    try {
      await ApiService.createStorageBox({
        displayName: boxForm.displayName,
        rows: boxForm.rows,
        cols: boxForm.cols,
        description: boxForm.description,
      })
      const refreshed = await ApiService.getStorageBoxes()
      setBoxes(refreshed)
      if (refreshed.length > 0) setSelectedBoxId(refreshed[0].id)
      setBoxForm({ displayName: "", rows: 9, cols: 9, description: "" })
    } catch (err) {
      console.error('Failed to create box', err)
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
    } catch (err) {
      console.error('Unallocate failed', err)
    } finally {
      setAllocating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (boxes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Storage Boxes</CardTitle>
          <CardDescription>Create your first storage box to start organizing strains</CardDescription>
        </CardHeader>
        <CardContent>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Storage Box
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Create Storage Box</CardTitle>
          <CardDescription>Rows/cols must be 9 or 10.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Display name"
              value={boxForm.displayName}
              onChange={(e) => setBoxForm({ ...boxForm, displayName: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={boxForm.rows.toString()}
              onValueChange={(val) => setBoxForm({ ...boxForm, rows: parseInt(val) })}
            >
              <SelectTrigger><SelectValue placeholder="Rows" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="9">9 rows</SelectItem>
                <SelectItem value="10">10 rows</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={boxForm.cols.toString()}
              onValueChange={(val) => setBoxForm({ ...boxForm, cols: parseInt(val) })}
            >
              <SelectTrigger><SelectValue placeholder="Cols" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="9">9 cols</SelectItem>
                <SelectItem value="10">10 cols</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-4 flex gap-2">
            <Input
              placeholder="Description (optional)"
              value={boxForm.description}
              onChange={(e) => setBoxForm({ ...boxForm, description: e.target.value })}
            />
            <Button onClick={handleCreateBox} disabled={creating || !boxForm.displayName.trim()}>
              {creating && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Create
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Box Selection */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {boxes.map(box => (
          <Button
            key={box.id}
            variant={selectedBoxId === box.id ? "default" : "outline"}
            onClick={() => setSelectedBoxId(box.id)}
            className="whitespace-nowrap"
          >
            <BoxIcon className="mr-2 h-4 w-4" />
            {box.displayName}
            {box._count && (
              <Badge variant="secondary" className="ml-2">
                {box.occupiedCells !== undefined
                  ? `${box.occupiedCells}/${box._count.cells}`
                  : `${box._count.cells}`} cells
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Grid View */}
      {selectedBox && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedBox.displayName}</span>
              <span className="text-sm font-normal text-muted-foreground">
                Grid: {selectedBox.rows} × {selectedBox.cols}
              </span>
            </CardTitle>
            {selectedBox.description && (
              <CardDescription>{selectedBox.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {loadingBox ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                <div
                  className="grid gap-1 mx-auto w-fit"
                  style={{
                    gridTemplateColumns: `repeat(${selectedBox.cols}, minmax(40px, 1fr))`
                  }}
                >
                  {selectedBox.cells?.map((cell) => {
                    const isOccupied = cell.status === 'OCCUPIED'
                    const strainId = cell.strain?.strain?.identifier
                    const strainDbId = cell.strain?.strain?.id

                    return (
                      <div
                        key={cell.id}
                        className={cn(
                          "h-10 w-10 flex items-center justify-center rounded border text-xs font-medium cursor-pointer transition-colors hover:ring-2 hover:ring-ring hover:ring-offset-1",
                          isOccupied
                            ? "bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400"
                            : "bg-background border-muted hover:bg-muted",
                          selectedCellCode === cell.cellCode && "ring-2 ring-primary"
                        )}
                        title={isOccupied ? `Strain: ${strainId}` : `Empty ${cell.cellCode}`}
                        onClick={() => setSelectedCellCode(cell.cellCode)}
                      >
                        {isOccupied ? (
                          <span className="truncate px-0.5 text-[8px]">{strainId?.split('-').pop()}</span>
                        ) : (
                          <span className="text-muted-foreground/30">{cell.cellCode}</span>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground justify-center">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded border bg-background" />
                    <span>Free</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded border border-green-300 bg-green-100 dark:bg-green-900/30 dark:border-green-800" />
                    <span>Occupied</span>
                  </div>
                </div>

                {selectedCell && (
                  <div className="mt-6 rounded border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Cell</p>
                        <p className="text-lg font-semibold">{selectedCell.cellCode}</p>
                      </div>
                      <Badge variant={selectedCell.status === 'OCCUPIED' ? "secondary" : "outline"}>
                        {selectedCell.status === 'OCCUPIED' ? "Occupied" : "Free"}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {selectedCell.status === 'OCCUPIED' ? 'Reassign strain' : 'Assign strain'}
                        </p>
                        <Select
                          value={allocForm.strainId ? allocForm.strainId.toString() : undefined}
                          onValueChange={(val) =>
                            setAllocForm((prev) => ({ ...prev, strainId: parseInt(val) }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select strain" />
                          </SelectTrigger>
                          <SelectContent>
                            {strains.map((s) => (
                              <SelectItem key={s.id} value={s.id.toString()}>
                                {s.identifier} {s.sample?.code ? `(${s.sample.code})` : ""}
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
                          Primary allocation
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
                            <Check className="h-4 w-4 mr-1" /> Open strain
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
                          <X className="h-4 w-4 mr-1" /> Deselect
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
                          {selectedCell.status === 'OCCUPIED' ? 'Reassign' : 'Allocate'}
                        </Button>
                        {selectedCell.status === 'OCCUPIED' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleUnallocate}
                            disabled={allocating}
                          >
                            {allocating && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                            Unallocate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
