"use client"

import * as React from "react"
import { ApiService, Sample } from "@/services/api"
import { Loader2, MapPin, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"

export function SampleList() {
    const router = useRouter()
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

    React.useEffect(() => {
        setLoading(true)
        ApiService.getSamples({
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
            console.error('Failed to load samples:', err)
            setLoading(false)
        })
    }, [search, filters, page, sortBy, sortOrder])

    if (loading && !meta) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[220px] max-w-sm">
                    <Input
                        placeholder="Search samples..."
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
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Sort:</span>
                        <select
                            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value as any); setPage(1); }}
                        >
                            <option value="collectedAt">By collection date</option>
                            <option value="createdAt">By created date</option>
                            <option value="code">By sample code</option>
                            <option value="siteName">By site</option>
                        </select>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); setPage(1); }}
                        >
                            {sortOrder === 'asc' ? 'Asc ↑' : 'Desc ↓'}
                        </Button>
                    </div>
                    <Button variant={filtersOpen ? "default" : "outline"} size="sm" className="mr-2" onClick={() => setFiltersOpen(v => !v)}>
                        <Filter className="mr-2 h-4 w-4" />
                        Filters
                    </Button>
                    <Button size="sm" onClick={() => router.push('/samples/new')}>Create Sample</Button>
                </div>
            </div>

            {filtersOpen && (
                <Card className="p-3 space-y-2">
                    <div className="grid gap-3 md:grid-cols-4 items-center">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">Site name contains</span>
                            <Input
                                placeholder="e.g. Site 8"
                                value={filters.site}
                                onChange={(e) => { setFilters({ ...filters, site: e.target.value }); setPage(1); }}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">Sample type</span>
                            <select
                                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                                value={filters.sampleType}
                                onChange={(e) => { setFilters({ ...filters, sampleType: e.target.value }); setPage(1); }}
                            >
                                <option value="">Any type</option>
                                <option value="PLANT">Plant</option>
                                <option value="ANIMAL">Animal</option>
                                <option value="WATER">Water</option>
                                <option value="SOIL">Soil</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">Collected After</span>
                            <Input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => { setFilters({ ...filters, dateFrom: e.target.value }); setPage(1); }}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">Collected Before</span>
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
                            Reset
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
                                        <CardTitle className="text-lg">{sample.code}</CardTitle>
                                        <CardDescription className="flex items-center gap-1 mt-1">
                                            <MapPin className="h-3 w-3" />
                                            {sample.siteName}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline">{sample.sampleType}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    {sample.description && (
                                        <p className="text-muted-foreground line-clamp-2">{sample.description}</p>
                                    )}
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>{new Date(sample.collectedAt).toLocaleDateString()}</span>
                                    </div>
                                    {sample._count && (
                                        <div className="flex gap-2 pt-2">
                                            <Badge variant="secondary" className="text-xs">
                                                {sample._count.strains} strains
                                            </Badge>
                                            <Badge variant="secondary" className="text-xs">
                                                {sample._count.photos} photos
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
                    Page {meta?.page ?? 1} of {meta?.totalPages ?? 1} ({meta?.total ?? samples.length} total)
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={(meta?.page ?? 1) <= 1 || loading}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        Prev
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={meta ? meta.page >= meta.totalPages : true}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
