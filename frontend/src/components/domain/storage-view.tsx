"use client"

import * as React from "react"
import { ApiService } from "@/services/api"
import { Loader2, Box as BoxIcon, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type BoxSummary = {
  id: number;
  displayName: string;
  rows: number;
  cols: number;
  description?: string;
  _count?: { cells: number };
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
  const [boxes, setBoxes] = React.useState<BoxSummary[]>([])
  const [selectedBoxId, setSelectedBoxId] = React.useState<number | null>(null)
  const [selectedBox, setSelectedBox] = React.useState<BoxDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [loadingBox, setLoadingBox] = React.useState(false)

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
  }, [])

  // Fetch Box details when selection changes
  React.useEffect(() => {
    if (!selectedBoxId) return
    setLoadingBox(true)
    ApiService.getBoxCells(selectedBoxId).then(box => {
      setSelectedBox(box)
      setLoadingBox(false)
    }).catch(err => {
      console.error('Failed to load box:', err)
      setLoadingBox(false)
    })
  }, [selectedBoxId])

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
                {box._count.cells} cells
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

                    return (
                      <div
                        key={cell.id}
                        className={cn(
                          "h-10 w-10 flex items-center justify-center rounded border text-xs font-medium cursor-pointer transition-colors hover:ring-2 hover:ring-ring hover:ring-offset-1",
                          isOccupied
                            ? "bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400"
                            : "bg-background border-muted hover:bg-muted"
                        )}
                        title={isOccupied ? `Strain: ${strainId}` : `Empty ${cell.cellCode}`}
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
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
