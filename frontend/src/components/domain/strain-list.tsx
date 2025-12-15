"use client"

import * as React from "react"
import { ApiService, Strain } from "@/services/api"
import { Loader2, Search, Filter, Plus } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useApiError } from "@/hooks/use-api-error"
import { useAuth } from "@/contexts/AuthContext"

interface StrainListProps {
    enabledPacks: string[]
    returnPath?: string
}

const STRAIN_SORT_BY_VALUES = ["createdAt", "identifier", "sampleCode", "taxonomy16s"] as const
type StrainSortBy = (typeof STRAIN_SORT_BY_VALUES)[number]
type SortOrder = "asc" | "desc"

function isStrainSortBy(value: unknown): value is StrainSortBy {
    return typeof value === "string" && (STRAIN_SORT_BY_VALUES as readonly string[]).includes(value)
}

function isSortOrder(value: unknown): value is SortOrder {
    return value === "asc" || value === "desc"
}

function readSortPreference(key: string): { sortBy: StrainSortBy; sortOrder: SortOrder } | null {
    if (typeof window === "undefined") return null
    try {
        const raw = window.localStorage.getItem(key)
        if (!raw) return null
        const parsed = JSON.parse(raw) as unknown
        if (!parsed || typeof parsed !== "object") return null

        const sortBy = (parsed as { sortBy?: unknown }).sortBy
        const sortOrder = (parsed as { sortOrder?: unknown }).sortOrder

        if (!isStrainSortBy(sortBy) || !isSortOrder(sortOrder)) return null
        return { sortBy, sortOrder }
    } catch {
        return null
    }
}

function getStorageSummary(storage: Strain['storage']) {
    const items = (storage ?? [])
        .map((s) => ({
            isPrimary: s.isPrimary,
            label: `${s.cell.box.displayName}: ${s.cell.cellCode}`,
        }))
        .sort((a, b) => {
            if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1
            return a.label.localeCompare(b.label)
        })

    const labels = items.map((i) => i.label)
    const first = labels[0]
    const extraCount = Math.max(0, labels.length - 1)

    return { first, extraCount, labels }
}

export function StrainList({ enabledPacks, returnPath = "/strains" }: StrainListProps) {
    const t = useTranslations('Strains')
    const tCommon = useTranslations('Common')
    const router = useRouter()
    const { user } = useAuth()
    const { handleError } = useApiError()
    const [strains, setStrains] = React.useState<Strain[]>([])
    const [meta, setMeta] = React.useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [search, setSearch] = React.useState("")
    const [page, setPage] = React.useState(1)
    const sortStorageKey = `strainList.sort:${returnPath}`
    const [sortBy, setSortBy] = React.useState<StrainSortBy>(() => readSortPreference(sortStorageKey)?.sortBy ?? "createdAt")
    const [sortOrder, setSortOrder] = React.useState<SortOrder>(() => readSortPreference(sortStorageKey)?.sortOrder ?? "desc")
    const [filtersOpen, setFiltersOpen] = React.useState(false)
    const [filters, setFilters] = React.useState({
        sampleCode: "",
        taxonomy: "",
        isolationRegion: "",
    })

    const loadStrains = React.useCallback(() => {
        setLoading(true)
        return ApiService.getStrains({
            search,
            sampleCode: filters.sampleCode || undefined,
            taxonomy: filters.taxonomy || undefined,
            isolationRegion: filters.isolationRegion || undefined,
            sortBy,
            sortOrder,
            page,
            limit: 10,
        }).then(res => {
            setStrains(res.data)
            setMeta(res.meta)
            setLoading(false)
        }).catch(err => {
            handleError(err, t('failedToLoadStrains'))
            setLoading(false)
        })
    }, [filters, handleError, page, search, sortBy, sortOrder, t])

    React.useEffect(() => {
        if (typeof window === "undefined") return
        window.localStorage.setItem(sortStorageKey, JSON.stringify({ sortBy, sortOrder }))
    }, [sortBy, sortOrder, sortStorageKey])

    React.useEffect(() => {
        loadStrains()
    }, [loadStrains])

    // --- Field Pack Logic ---
    const showTaxonomy = enabledPacks.includes("taxonomy")
    const showGrowth = enabledPacks.includes("growth_characteristics")

    if (loading && !meta) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
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
                <div className="flex gap-2 flex-wrap items-center">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>{t('sort')}</span>
                        <select
                            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value as StrainSortBy); setPage(1); }}
                        >
                            <option value="createdAt">{t('created')}</option>
                            <option value="identifier">{t('identifier')}</option>
                            <option value="sampleCode">{t('sampleCode')}</option>
                            <option value="taxonomy16s">{t('taxonomy')}</option>
                        </select>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); setPage(1); }}
                        >
                            {sortOrder === 'asc' ? `${t('asc')} ↑` : `${t('desc')} ↓`}
                        </Button>
                    </div>
                    <Button variant={filtersOpen ? "default" : "outline"} size="sm" onClick={() => setFiltersOpen((v) => !v)}>
                        <Filter className="mr-2 h-4 w-4" />
                        {t('filters')}
                    </Button>
                    {user && (
                        <div className="flex justify-end mb-4">
                            <Button onClick={() => router.push('/strains/new')}>
                                <Plus className="mr-2 h-4 w-4" />
                                {t('createStrain')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {filtersOpen && (
                <Card className="p-3 space-y-2">
                    <div className="grid gap-2 md:grid-cols-3">
                        <Input
                            placeholder={t('sampleCodePlaceholder')}
                            value={filters.sampleCode}
                            onChange={(e) => { setFilters({ ...filters, sampleCode: e.target.value }); setPage(1); }}
                        />
                        <Input
                            placeholder={t('taxonomySearchPlaceholder')}
                            value={filters.taxonomy}
                            onChange={(e) => { setFilters({ ...filters, taxonomy: e.target.value }); setPage(1); }}
                        />
                        <Select
                            value={filters.isolationRegion}
                            onValueChange={(value) => { setFilters({ ...filters, isolationRegion: value === "ALL" ? "" : value }); setPage(1); }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('isolationRegion')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">{t('allRegions')}</SelectItem>
                                <SelectItem value="RHIZOSPHERE">Rhizosphere</SelectItem>
                                <SelectItem value="ENDOSPHERE">Endosphere</SelectItem>
                                <SelectItem value="PHYLLOSPHERE">Phyllosphere</SelectItem>
                                <SelectItem value="SOIL">Soil</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </Card>
            )}

            <Card>
                <CardHeader className="p-4">
                    <CardTitle className="text-lg">{t('title')}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[150px]">{t('identifier')}</TableHead>
                                    <TableHead>{t('sampleSource')}</TableHead>
                                    <TableHead className="w-[220px]">{t('storage')}</TableHead>
                                    {showTaxonomy && <TableHead>{t('taxonomy16s')}</TableHead>}
                                    {showGrowth && <TableHead>{t('gramStain')}</TableHead>}
                                    {showGrowth && <TableHead>{t('characteristics')}</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {strains.map((strain) => {
                                    const storageSummary = getStorageSummary(strain.storage)

                                    return (
                                        <TableRow
                                            key={strain.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => router.push(`/strains/${strain.id}?returnTo=${encodeURIComponent(returnPath)}`)}
                                        >
                                            <TableCell className="font-medium">
                                                {strain.identifier}
                                                {strain.genetics?.wgsStatus && strain.genetics.wgsStatus !== 'NONE' && (
                                                    <Badge variant="secondary" className="ml-2 text-[10px]">{t('seqBadge')}</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{strain.sample?.code || '-'}</TableCell>
                                            <TableCell>
                                                {storageSummary.first ? (
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="truncate" title={storageSummary.labels.join('\n')}>
                                                            {storageSummary.first}
                                                        </span>
                                                        {storageSummary.extraCount > 0 && (
                                                            <Badge variant="secondary" className="text-[10px] shrink-0">
                                                                +{storageSummary.extraCount}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>

                                            {showTaxonomy && (
                                                <TableCell>
                                                    {strain.taxonomy16s ? (
                                                        <span className="italic">{strain.taxonomy16s}</span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                            )}

                                            {showGrowth && (
                                                <TableCell>
                                                    {strain.phenotypes?.find(p => p.traitName === 'Gram Stain')?.result === '+' && <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">{t('gramPosBadge')}</Badge>}
                                                    {strain.phenotypes?.find(p => p.traitName === 'Gram Stain')?.result === '-' && <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">{t('gramNegBadge')}</Badge>}
                                                </TableCell>
                                            )}

                                            {showGrowth && (
                                                <TableCell>
                                                    <div className="flex gap-1 flex-wrap">
                                                        {strain.phenotypes?.some(p => p.traitName === 'Phosphate Solubilization' && p.result === '+') && <Badge variant="secondary" className="text-[10px]">{t('pPosBadge')}</Badge>}
                                                        {strain.phenotypes?.some(p => p.traitName === 'Siderophore Production' && p.result === '+') && <Badge variant="secondary" className="text-[10px]">{t('sidPosBadge')}</Badge>}
                                                        {strain.phenotypes?.some(p => p.traitName === 'Pigment Secretion' && p.result === '+') && <Badge variant="secondary" className="text-[10px]">{t('pigmentBadge')}</Badge>}
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="md:hidden space-y-2 p-4">
                        {strains.map((strain) => {
                            const storageSummary = getStorageSummary(strain.storage)

                            return (
                                <div
                                    key={strain.id}
                                    className="rounded-lg border p-3 shadow-xs hover:bg-muted/50 transition-colors cursor-pointer"
                                    onClick={() => router.push(`/strains/${strain.id}?returnTo=${encodeURIComponent(returnPath)}`)}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="font-semibold">{strain.identifier}</div>
                                        <div className="flex items-center gap-1">
                                            {strain.genetics?.wgsStatus && strain.genetics.wgsStatus !== 'NONE' && <Badge variant="secondary" className="text-[10px]">{t('seqBadge')}</Badge>}
                                            {strain.phenotypes?.find(p => p.traitName === 'Gram Stain')?.result === '+' && <Badge variant="outline" className="text-[10px]">{t('gramPosBadge')}</Badge>}
                                            {strain.phenotypes?.find(p => p.traitName === 'Gram Stain')?.result === '-' && <Badge variant="outline" className="text-[10px]">{t('gramNegBadge')}</Badge>}
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {t('sample')}: {strain.sample?.code || '-'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {t('storage')}: {storageSummary.first ? (
                                            <span title={storageSummary.labels.join('\n')}>
                                                {storageSummary.first}
                                                {storageSummary.extraCount > 0 ? ` +${storageSummary.extraCount}` : ''}
                                            </span>
                                        ) : (
                                            '-'
                                        )}
                                    </div>
                                    {showTaxonomy && (
                                        <div className="text-sm">
                                            {strain.taxonomy16s ? <span className="italic">{strain.taxonomy16s}</span> : <span className="text-muted-foreground">-</span>}
                                        </div>
                                    )}
                                    {showGrowth && (
                                        <div className="flex flex-wrap gap-1 pt-2">
                                            {strain.phenotypes?.some(p => p.traitName === 'Phosphate Solubilization' && p.result === '+') && <Badge variant="secondary" className="text-[10px]">{t('pPosBadge')}</Badge>}
                                            {strain.phenotypes?.some(p => p.traitName === 'Siderophore Production' && p.result === '+') && <Badge variant="secondary" className="text-[10px]">{t('sidPosBadge')}</Badge>}
                                            {strain.phenotypes?.some(p => p.traitName === 'Pigment Secretion' && p.result === '+') && <Badge variant="secondary" className="text-[10px]">{t('pigmentBadge')}</Badge>}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                    {tCommon('pageInfo', { current: meta?.page ?? 1, total: meta?.totalPages ?? 1, count: meta?.total ?? strains.length })}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={(meta?.page ?? 1) <= 1 || loading}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        {tCommon('prev')}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={meta ? meta.page >= meta.totalPages : true}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        {tCommon('next')}
                    </Button>
                </div>
            </div>
        </div>
    )
}
