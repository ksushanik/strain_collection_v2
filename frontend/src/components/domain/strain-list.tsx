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
import { routing, usePathname, useRouter } from "@/i18n/routing"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useApiError } from "@/hooks/use-api-error"
import { useAuth } from "@/contexts/AuthContext"
import { isPositiveLike } from "@/lib/trait-labels"
import { formatSampleCodeForDisplay } from "@/lib/sample-code"

interface StrainListProps {
    enabledPacks: string[]
    returnPath?: string
}

const STRAIN_SORT_BY_VALUES = ["createdAt", "identifier", "sampleCode", "taxonomy16s"] as const
type StrainSortBy = (typeof STRAIN_SORT_BY_VALUES)[number]
type SortOrder = "asc" | "desc"
type Phenotype = NonNullable<Strain["phenotypes"]>[number]

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

function getTaxonomyForList(strain: Strain): string | null {
    const taxonomy16s = (strain.taxonomy16s ?? "").trim()
    if (taxonomy16s) return taxonomy16s
    const ncbiScientificName = (strain.ncbiScientificName ?? "").trim()
    return ncbiScientificName || null
}

function getPageFromSearchParams(searchParams: ReturnType<typeof useSearchParams>) {
    const rawPage = searchParams?.get("page")
    const parsed = rawPage ? Number.parseInt(rawPage, 10) : 1
    if (Number.isNaN(parsed) || parsed < 1) return 1
    return parsed
}

function normalizeReturnPath(returnPath: string | undefined, pathname: string | null) {
    const base = returnPath ?? pathname ?? "/strains"
    if (!base.startsWith("/") || !pathname) return base

    const pathLocale = pathname.split("/")[1]
    const baseLocale = base.split("/")[1]
    const hasPathLocale = routing.locales.includes(pathLocale)
    const hasBaseLocale = routing.locales.includes(baseLocale)

    if (hasPathLocale && !hasBaseLocale) {
        return `/${pathLocale}${base}`
    }

    return base
}

export function StrainList({ enabledPacks, returnPath = "/strains" }: StrainListProps) {
    const t = useTranslations('Strains')
    const tCommon = useTranslations('Common')
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { user } = useAuth()
    const { handleError } = useApiError()
    const [strains, setStrains] = React.useState<Strain[]>([])
    const [meta, setMeta] = React.useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [search, setSearch] = React.useState("")
    const [page, setPage] = React.useState(() => getPageFromSearchParams(searchParams))
    const normalizedReturnPath = normalizeReturnPath(returnPath, pathname)
    const sortStorageKey = `strainList.sort:${normalizedReturnPath}`
    const [sortBy, setSortBy] = React.useState<StrainSortBy>(() => readSortPreference(sortStorageKey)?.sortBy ?? "createdAt")
    const [sortOrder, setSortOrder] = React.useState<SortOrder>(() => readSortPreference(sortStorageKey)?.sortOrder ?? "desc")
    const [filtersOpen, setFiltersOpen] = React.useState(false)
    const [filters, setFilters] = React.useState({
        sampleCode: "",
        taxonomy: "",
        isolationRegion: "",
        hasGenome: "any",
        gramStain: "any",
        amylase: "any",
        phosphates: "any",
        siderophores: "any",
        pigment: "any",
    })

    const matchesTrait = (p: Phenotype, code: string, name: string) =>
        p?.traitDefinition?.code === code ||
        p?.traitCode === code ||
        p?.traitName === name ||
        (code === 'pigment_secretion' && p?.traitName === 'Pigment Production')

    const isNegativeLike = (result: unknown) => {
        if (typeof result !== 'string') return false
        const normalized = result.trim().toLowerCase()
        return normalized === '-' || normalized.includes('negative') || normalized === 'false'
    }

    const resolveBoolFilter = (value: string) => {
        if (value === "true") return true
        if (value === "false") return false
        return undefined
    }

    const requestIdRef = React.useRef(0)

    const loadStrains = React.useCallback(() => {
        const requestId = requestIdRef.current + 1
        requestIdRef.current = requestId
        setLoading(true)
        return ApiService.getStrains({
            search,
            sampleCode: filters.sampleCode || undefined,
            taxonomy: filters.taxonomy || undefined,
            isolationRegion: filters.isolationRegion || undefined,
            hasGenome: resolveBoolFilter(filters.hasGenome),
            gramStain: filters.gramStain === "any" ? undefined : (filters.gramStain as "positive" | "negative"),
            amylase: resolveBoolFilter(filters.amylase),
            phosphateSolubilization: resolveBoolFilter(filters.phosphates),
            siderophoreProduction: resolveBoolFilter(filters.siderophores),
            pigmentSecretion: resolveBoolFilter(filters.pigment),
            sortBy,
            sortOrder,
            page,
            limit: 10,
        }).then(res => {
            if (requestIdRef.current !== requestId) return
            setStrains(res.data)
            setMeta(res.meta)
            setLoading(false)
        }).catch(err => {
            if (requestIdRef.current !== requestId) return
            handleError(err, t('failedToLoadStrains'))
            setLoading(false)
        })
    }, [filters, handleError, page, search, sortBy, sortOrder, t])

    const pageFromParams = React.useMemo(
        () => getPageFromSearchParams(searchParams),
        [searchParams],
    )

    React.useEffect(() => {
        setPage((current) => (current === pageFromParams ? current : pageFromParams))
    }, [pageFromParams])

    React.useEffect(() => {
        if (pageFromParams !== page) return
        if (!pathname) return
        const params = new URLSearchParams(searchParams?.toString() ?? "")
        const desired = page > 1 ? String(page) : null
        const current = params.get("page")
        if ((desired ?? "") === (current ?? "")) return
        if (desired) {
            params.set("page", desired)
        } else {
            params.delete("page")
        }
        const qs = params.toString()
        const target = qs ? `${pathname}?${qs}` : pathname
        router.replace(target)
    }, [page, pathname, router, searchParams])

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

    const returnToPath = React.useMemo(() => {
        const [path, query] = normalizedReturnPath.split("?")
        const params = new URLSearchParams(query ?? "")
        const samePath = pathname && path === pathname
        const currentParams = samePath ? new URLSearchParams(searchParams?.toString() ?? "") : null
        const targetParams = currentParams ?? params

        if (page > 1) {
            targetParams.set("page", String(page))
        } else {
            targetParams.delete("page")
        }
        const qs = targetParams.toString()
        return qs ? `${path}?${qs}` : path
    }, [normalizedReturnPath, page, pathname, searchParams])

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
                            <option value="taxonomy16s">{t('taxonomy16s')}</option>
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
                        <Button size="sm" onClick={() => router.push('/strains/new')}>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('createStrain')}
                        </Button>
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
                        <Select
                            value={filters.hasGenome}
                            onValueChange={(value) => { setFilters({ ...filters, hasGenome: value }); setPage(1); }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('hasGenome')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="any">{t('anyGenome')}</SelectItem>
                                <SelectItem value="true">{t('yes')}</SelectItem>
                                <SelectItem value="false">{t('no')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.gramStain}
                            onValueChange={(value) => { setFilters({ ...filters, gramStain: value }); setPage(1); }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('gramStain')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="any">{t('anyGramStain')}</SelectItem>
                                <SelectItem value="positive">{t('gramPositive')}</SelectItem>
                                <SelectItem value="negative">{t('gramNegative')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.amylase}
                            onValueChange={(value) => { setFilters({ ...filters, amylase: value }); setPage(1); }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('amylase')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="any">{t('anyAmylase')}</SelectItem>
                                <SelectItem value="true">{t('yes')}</SelectItem>
                                <SelectItem value="false">{t('no')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.phosphates}
                            onValueChange={(value) => { setFilters({ ...filters, phosphates: value }); setPage(1); }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('phosphates')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="any">{t('anyPhosphates')}</SelectItem>
                                <SelectItem value="true">{t('yes')}</SelectItem>
                                <SelectItem value="false">{t('no')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.siderophores}
                            onValueChange={(value) => { setFilters({ ...filters, siderophores: value }); setPage(1); }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('siderophores')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="any">{t('anySiderophores')}</SelectItem>
                                <SelectItem value="true">{t('yes')}</SelectItem>
                                <SelectItem value="false">{t('no')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.pigment}
                            onValueChange={(value) => { setFilters({ ...filters, pigment: value }); setPage(1); }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('pigmentSecretion')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="any">{t('anyPigment')}</SelectItem>
                                <SelectItem value="true">{t('yes')}</SelectItem>
                                <SelectItem value="false">{t('no')}</SelectItem>
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
                                    <TableHead>{t('gramStain')}</TableHead>
                                    {showGrowth && <TableHead>{t('characteristics')}</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {strains.map((strain) => {
                                    const storageSummary = getStorageSummary(strain.storage)
                                    const taxonomyForList = getTaxonomyForList(strain)

                                    return (
                                        <TableRow
                                            key={strain.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => router.push(`/strains/${strain.id}?returnTo=${encodeURIComponent(returnToPath)}`)}
                                        >
                                            <TableCell className="font-medium">
                                                {strain.identifier}
                                                {strain.genetics?.wgsStatus && strain.genetics.wgsStatus !== 'NONE' && (
                                                    <Badge variant="secondary" className="ml-2 text-[10px]">{t('seqBadge')}</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{strain.sample?.code ? formatSampleCodeForDisplay(strain.sample.code) : '-'}</TableCell>
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
                                                    {taxonomyForList ? (
                                                        <span className="italic">{taxonomyForList}</span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                            )}

                                            <TableCell>
                                              {strain.gramStainLabel && (
                                                <Badge 
                                                  variant="outline" 
                                                  className={
                                                    strain.gramStainLabel.includes("+") 
                                                      ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50" 
                                                      : strain.gramStainLabel.includes("-") 
                                                        ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-50"
                                                        : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-50"
                                                  }
                                                >
                                                  {strain.gramStainLabel}
                                                </Badge>
                                              )}
                                            </TableCell>

                                            {showGrowth && (
                                                <TableCell>
                                                    <div className="flex gap-1 flex-wrap">
                                                        {strain.phenotypes?.some((p) => matchesTrait(p, 'amylase', 'Amylase') && isPositiveLike(p.result)) && <Badge variant="secondary" className="text-[10px]">{t('amylasePosBadge')}</Badge>}
                                                        {strain.phenotypes?.some((p) => matchesTrait(p, 'phosphate_solubilization', 'Phosphate Solubilization') && isPositiveLike(p.result)) && <Badge variant="secondary" className="text-[10px]">{t('pPosBadge')}</Badge>}
                                                        {strain.phenotypes?.some((p) => matchesTrait(p, 'siderophore_production', 'Siderophore Production') && isPositiveLike(p.result)) && <Badge variant="secondary" className="text-[10px]">{t('sidPosBadge')}</Badge>}
                                                        {strain.phenotypes?.some((p) => matchesTrait(p, 'pigment_secretion', 'Pigment Secretion') && isPositiveLike(p.result)) && <Badge variant="secondary" className="text-[10px]">{t('pigmentBadge')}</Badge>}
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
                            const taxonomyForList = getTaxonomyForList(strain)

                            return (
                                <div
                                    key={strain.id}
                                    className="rounded-lg border p-3 shadow-xs hover:bg-muted/50 transition-colors cursor-pointer"
                                    onClick={() => router.push(`/strains/${strain.id}?returnTo=${encodeURIComponent(returnToPath)}`)}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="font-semibold">{strain.identifier}</div>
                                        <div className="flex items-center gap-1">
                                            {strain.genetics?.wgsStatus && strain.genetics.wgsStatus !== 'NONE' && <Badge variant="secondary" className="text-[10px]">{t('seqBadge')}</Badge>}
                                            {isPositiveLike(strain.phenotypes?.find((p) => matchesTrait(p, 'gram_stain', 'Gram Stain'))?.result) && <Badge variant="outline" className="text-[10px]">{t('gramPosBadge')}</Badge>}
                                            {isNegativeLike(strain.phenotypes?.find((p) => matchesTrait(p, 'gram_stain', 'Gram Stain'))?.result) && <Badge variant="outline" className="text-[10px]">{t('gramNegBadge')}</Badge>}
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {t('sample')}: {strain.sample?.code ? formatSampleCodeForDisplay(strain.sample.code) : '-'}
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
                                            {taxonomyForList ? <span className="italic">{taxonomyForList}</span> : <span className="text-muted-foreground">-</span>}
                                        </div>
                                    )}
                                    {showGrowth && (
                                        <div className="flex flex-wrap gap-1 pt-2">
                                            {strain.phenotypes?.some((p) => matchesTrait(p, 'amylase', 'Amylase') && isPositiveLike(p.result)) && <Badge variant="secondary" className="text-[10px]">{t('amylasePosBadge')}</Badge>}
                                            {strain.phenotypes?.some((p) => matchesTrait(p, 'phosphate_solubilization', 'Phosphate Solubilization') && isPositiveLike(p.result)) && <Badge variant="secondary" className="text-[10px]">{t('pPosBadge')}</Badge>}
                                            {strain.phenotypes?.some((p) => matchesTrait(p, 'siderophore_production', 'Siderophore Production') && isPositiveLike(p.result)) && <Badge variant="secondary" className="text-[10px]">{t('sidPosBadge')}</Badge>}
                                            {strain.phenotypes?.some((p) => matchesTrait(p, 'pigment_secretion', 'Pigment Secretion') && isPositiveLike(p.result)) && <Badge variant="secondary" className="text-[10px]">{t('pigmentBadge')}</Badge>}
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
