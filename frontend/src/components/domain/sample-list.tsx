
"use client"

import * as React from "react"
import { ApiService, Sample } from "@/services/api"
import { Loader2, MapPin, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { useRouter } from "@/i18n/routing"
import { Link } from "@/i18n/routing"
import { Input } from "@/components/ui/input"
import { useApiError } from "@/hooks/use-api-error"
import { useTranslations } from "next-intl"
import { useAuth } from "@/contexts/AuthContext"
import { formatSampleCodeForDisplay } from "@/lib/sample-code"
import { RichTextDisplay } from "@/components/ui/rich-text-display"

export function SampleList() {
    const t = useTranslations('Samples')
    const tCommon = useTranslations('Common')
    const router = useRouter()
    const { user } = useAuth()
    const { handleError } = useApiError()
    const [samples, setSamples] = React.useState<Sample[]>([])
    const [meta, setMeta] = React.useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [search, setSearch] = React.useState("")
    const [filtersOpen, setFiltersOpen] = React.useState(false)
    const [page, setPage] = React.useState(1)
    const [filters, setFilters] = React.useState({
        site: "",
        dateFrom: "",
        dateTo: "",
        sampleType: "",
    })
    const [sortBy, setSortBy] = React.useState<'siteName' | 'createdAt' | 'collectedAt' | 'code'>('collectedAt')
    const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc')

    const loadSamples = React.useCallback(() => {
        setLoading(true)
        return ApiService.getSamples({
            search,
            site: filters.site || undefined,
            dateFrom: filters.dateFrom || undefined,
            dateTo: filters.dateTo || undefined,
            sampleType: filters.sampleType || undefined,
            sortBy,
            sortOrder,
            page,
            limit: 9,
        }).then(res => {
            setSamples(res.data)
            setMeta(res.meta)
            setLoading(false)
        }).catch(err => {
            handleError(err, t('failedToLoadSamples'))
            setLoading(false)
        })
    }, [filters, handleError, page, search, sortBy, sortOrder, t])

    React.useEffect(() => {
        loadSamples()
    }, [loadSamples])

    if (loading && !meta) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="relative flex-1 min-w-[220px] sm:max-w-sm">
                    <Input
                        placeholder={t('searchPlaceholder')}
                        className="pl-8"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                    {loading ? (
                        <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                        <MapPin className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    )}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>{t('sort')}</span>
                        <select
                            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value as 'siteName' | 'createdAt' | 'collectedAt' | 'code'); setPage(1); }}
                        >
                            <option value="collectedAt">{t('byCollectionDate')}</option>
                            <option value="createdAt">{t('byCreatedDate')}</option>
                            <option value="code">{t('bySampleCode')}</option>
                            <option value="siteName">{t('bySite')}</option>
                        </select>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); setPage(1); }}
                        >
                            {sortOrder === 'asc' ? t('ascSort') : t('descSort')}
                        </Button>
                    </div>
                    <Button variant={filtersOpen ? "default" : "outline"} size="sm" className="mr-2" onClick={() => setFiltersOpen(v => !v)}>
                        <Filter className="mr-2 h-4 w-4" />
                        {t('filters')}
                    </Button>
                    {user && (
                        <Button size="sm" onClick={() => router.push('/samples/new')}>{t('createSample')}</Button>
                    )}
                </div>
            </div>

            {filtersOpen && (
                <Card className="p-3 space-y-2">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-center">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">{t('siteNameContains')}</span>
                            <Input
                                placeholder={t('siteNamePlaceholder')}
                                value={filters.site}
                                onChange={(e) => { setFilters({ ...filters, site: e.target.value }); setPage(1); }}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">{t('sampleType')}</span>
                            <select
                                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                                value={filters.sampleType}
                                onChange={(e) => { setFilters({ ...filters, sampleType: e.target.value }); setPage(1); }}
                            >
                                <option value="">{t('anyType')}</option>
                                <option value="PLANT">{t('plant')}</option>
                                <option value="ANIMAL">{t('animal')}</option>
                                <option value="WATER">{t('water')}</option>
                                <option value="SOIL">{t('soil')}</option>
                                <option value="OTHER">{t('other')}</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">{t('collectedAfter')}</span>
                            <Input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => { setFilters({ ...filters, dateFrom: e.target.value }); setPage(1); }}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">{t('collectedBefore')}</span>
                            <Input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => { setFilters({ ...filters, dateTo: e.target.value }); setPage(1); }}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setFilters({ site: "", sampleType: "", dateFrom: "", dateTo: "" }); setPage(1); }}
                        >
                            {tCommon('reset')}
                        </Button>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {samples.map((sample) => (
                    <Link key={sample.id} href={`/samples/${sample.id}`} className="block">
                        <Card className="hover:shadow-md transition-shadow h-full">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{formatSampleCodeForDisplay(sample.code)}</CardTitle>
                                        <CardDescription className="flex items-center gap-1 mt-1">
                                            <MapPin className="h-3 w-3" />
                                            {sample.siteName}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline">{t(sample.sampleType.toLowerCase())}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    {sample.description && (
                                        <RichTextDisplay
                                            content={sample.description}
                                            className="text-muted-foreground line-clamp-2"
                                        />
                                    )}
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>{new Date(sample.collectedAt).toLocaleDateString()}</span>
                                    </div>
                                    {sample._count && (
                                        <div className="flex gap-2 pt-2">
                                            <Badge variant="secondary" className="text-xs">
                                                {sample._count.strains} {tCommon('strains')}
                                            </Badge>
                                            <Badge variant="secondary" className="text-xs">
                                                {sample._count.photos} {tCommon('photos')}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                    {tCommon('page')} {meta?.page ?? 1} {tCommon('of')} {meta?.totalPages ?? 1} ({meta?.total ?? samples.length} {tCommon('total')})
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
