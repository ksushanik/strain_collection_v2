"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { ApiService } from "@/services/api"
import { Loader2, Microscope, Beaker, Archive, Boxes } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

export default function Home() {
  const t = useTranslations('Dashboard')
  const tCommon = useTranslations('Common')
  const { user } = useAuth()

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
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-1 pt-6 pb-2">
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Strains card */}
        <Card className="animate-fade-in-up stagger-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('totalStrains')}</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
              <Microscope className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-3xl font-bold tracking-tight">{stats.totalStrains}</div>
            )}
          </CardContent>
        </Card>

        {/* Samples card */}
        <Card className="animate-fade-in-up stagger-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('activeSamples')}</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40">
              <Beaker className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-3xl font-bold tracking-tight">{stats.totalSamples}</div>
            )}
          </CardContent>
        </Card>

        {/* Storage occupancy card with progress bar */}
        <Card className="animate-fade-in-up stagger-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('storageOccupancy')}</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40">
              <Archive className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-3xl font-bold tracking-tight">
                  {stats.occupiedCells}
                  <span className="text-lg font-normal text-muted-foreground">/{stats.occupiedCells + stats.freeCells}</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-700"
                    style={{ width: `${stats.occupiedCells + stats.freeCells > 0 ? Math.round((stats.occupiedCells / (stats.occupiedCells + stats.freeCells)) * 100) : 0}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t('occupiedTotal')}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Boxes card */}
        <Card className="animate-fade-in-up stagger-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('storageBoxes')}</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/40">
              <Boxes className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-3xl font-bold tracking-tight">{stats.totalBoxes}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {!stats.loading && stats.recent.length > 0 && user && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">{t('recentStrains')}</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {stats.recent.map((r, index) => (
              <Link key={r.id} href={`/strains/${r.id}`} className="block">
                <Card className={cn(
                  "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full group animate-fade-in-up",
                  `stagger-${Math.min(index + 1, 6)}`
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                        <Microscope className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-sm font-semibold truncate">{r.identifier}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {tCommon('sample')}: {r.sample?.code || tCommon('unknown')}
                        </p>
                      </div>
                    </div>
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
