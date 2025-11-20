"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { ApiService } from "@/services/api"
import { Loader2, Microscope, Beaker, Archive } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const [stats, setStats] = React.useState({
    totalStrains: 0,
    totalSamples: 0,
    loading: true,
  })

  React.useEffect(() => {
    Promise.all([
      ApiService.getStrains(),
      ApiService.getSamples(),
    ]).then(([strains, samples]) => {
      setStats({
        totalStrains: strains.length,
        totalSamples: samples.length,
        loading: false,
      })
    }).catch(err => {
      console.error('Failed to load stats:', err)
      setStats(prev => ({ ...prev, loading: false }))
    })
  }, [])

  return (
    <MainLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to BioCollection</h1>
        <p className="mt-2 text-muted-foreground">
          Microbiological Data Management System
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              <div className="text-3xl font-bold text-muted-foreground">-</div>
              <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
