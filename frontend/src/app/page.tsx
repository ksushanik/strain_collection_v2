"use client"

import * as React from "react"
import Link from "next/link"
import { ApiService } from "@/services/api"
import { Loader2, Microscope, Beaker, Archive, Boxes } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const [stats, setStats] = React.useState({
    totalStrains: 0,
    totalSamples: 0,
    totalBoxes: 0,
    occupiedCells: 0,
    freeCells: 0,
    recent: [] as { id: number; identifier: string; sample?: { id: number; code: string | null } }[],
    loading: true,
  })

  React.useEffect(() => {
    ApiService.getAnalyticsOverview()
      .then((res) => {
        setStats({
          totalStrains: res.totalStrains,
          totalSamples: res.totalSamples,
          totalBoxes: res.totalBoxes,
          occupiedCells: res.occupiedCells,
          freeCells: res.freeCells,
          recent: res.recentAdditions,
          loading: false,
        })
      }).catch(err => {
        console.error('Failed to load stats:', err)
        setStats(prev => ({ ...prev, loading: false }))
      })
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold tracking-tight">Welcome to BioCollection</h1>
      <p className="mt-2 text-muted-foreground">
        Microbiological Data Management System
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Strains</CardTitle>
            <Microscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-3xl font-bold">{stats.totalStrains}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Samples</CardTitle>
            <Beaker className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-3xl font-bold">{stats.totalSamples}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Storage Occupancy</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-3xl font-bold">{stats.occupiedCells}/{stats.occupiedCells + stats.freeCells}</div>
                <p className="text-xs text-muted-foreground mt-1">Occupied / Total cells</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Storage Boxes</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-3xl font-bold">{stats.totalBoxes}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {!stats.loading && stats.recent.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Recent Strains</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {stats.recent.map((r) => (
              <Link key={r.id} href={`/strains/${r.id}`} className="block">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{r.identifier}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Sample: {r.sample?.code || 'Unknown'}
                    </p>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
