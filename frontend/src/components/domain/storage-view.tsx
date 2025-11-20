"use client"

import * as React from "react"
import { MockApiService } from "@/services/mock-api"
import { StorageBox, StorageCell } from "@/types/domain"
import { Loader2, Box as BoxIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function StorageView() {
  const [boxes, setBoxes] = React.useState<StorageBox[]>([])
  const [selectedBoxId, setSelectedBoxId] = React.useState<number | null>(null)
  const [cells, setCells] = React.useState<StorageCell[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadingCells, setLoadingCells] = React.useState(false)

  // Fetch Boxes on mount
  React.useEffect(() => {
    MockApiService.getStorageBoxes().then(data => {
      setBoxes(data)
      if (data.length > 0) setSelectedBoxId(data[0].id)
      setLoading(false)
    })
  }, [])

  // Fetch Cells when box changes
  React.useEffect(() => {
    if (!selectedBoxId) return
    setLoadingCells(true)
    MockApiService.getBoxCells(selectedBoxId).then(data => {
      setCells(data)
      setLoadingCells(false)
    })
  }, [selectedBoxId])

  if (loading) return <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />

  const selectedBox = boxes.find(b => b.id === selectedBoxId)

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
            <Badge variant="secondary" className="ml-2">{box.occupancy}</Badge>
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
          </CardHeader>
          <CardContent>
            {loadingCells ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div
                className="grid gap-1 mx-auto w-fit"
                style={{
                  gridTemplateColumns: `repeat(${selectedBox.cols}, minmax(40px, 1fr))`
                }}
              >
                {/* Render Cells */}
                {Array.from({ length: selectedBox.rows * selectedBox.cols }).map((_, idx) => {
                  const row = Math.floor(idx / selectedBox.cols) + 1
                  const col = (idx % selectedBox.cols) + 1
                  const cell = cells.find(c => c.row === row && c.col === col)
                  const isOccupied = cell?.status === 'OCCUPIED'

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "h-10 w-10 flex items-center justify-center rounded border text-xs font-medium cursor-pointer transition-colors hover:ring-2 hover:ring-ring hover:ring-offset-1",
                        isOccupied
                          ? "bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400"
                          : "bg-background border-muted hover:bg-muted"
                      )}
                      title={isOccupied ? `Strain: ${cell?.strainIdentifier}` : `Empty (${row},${col})`}
                    >
                      {isOccupied ? (
                        <span className="truncate px-0.5 text-[8px]">{cell?.strainIdentifier?.split('-').pop()}</span>
                      ) : (
                        <span className="text-muted-foreground/30">{row}{String.fromCharCode(64 + col)}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

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
          </CardContent>
        </Card>
      )}
    </div>
  )
}
