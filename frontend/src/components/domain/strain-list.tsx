
"use client"

import * as React from "react"
import { ApiService, Strain } from "@/services/api"
import { Loader2, Search, Filter } from "lucide-react"
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
import { useRouter, usePathname } from "@/i18n/routing"
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

interface StrainListProps {
    enabledPacks: string[]
    returnPath?: string
}

export function StrainList({ enabledPacks, returnPath = "/strains" }: StrainListProps) {
    const t = useTranslations('Strains')
    const tCommon = useTranslations('Common')
    const router = useRouter()
    const { handleError } = useApiError()
    const [strains, setStrains] = React.useState<Strain[]>([])
    const [meta, setMeta] = React.useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [search, setSearch] = React.useState("")
    const [page, setPage] = React.useState(1)
    const [sortBy, setSortBy] = React.useState<'createdAt' | 'identifier' | 'sampleCode' | 'taxonomy16s'>('createdAt')
    const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc')
    const [filtersOpen, setFiltersOpen] = React.useState(false)
    const [filters, setFilters] = React.useState({
        sampleCode: "",
        taxonomy: "",
        genome: "",
        hasGenome: false,
        antibioticActivity: "",
        seq: false,
        gramStain: "",
        phosphates: false,
        siderophores: false,
        pigmentSecretion: false,
        amylase: "",
        isolationRegion: "",
        biochemistry: "",
        iuk: "",
    })

    React.useEffect(() => {
        setLoading(true)
        ApiService.getStrains({
            search,
            sampleCode: filters.sampleCode || undefined,
            taxonomy: filters.taxonomy || undefined,
            genome: filters.genome || undefined,
            hasGenome: filters.hasGenome ? true : undefined,
            antibioticActivity: filters.antibioticActivity || undefined,
            seq: filters.seq ? true : undefined,
            gramStain: filters.gramStain || undefined,
            phosphates: filters.phosphates ? true : undefined,
            siderophores: filters.siderophores ? true : undefined,
            pigmentSecretion: filters.pigmentSecretion ? true : undefined,
            amylase: filters.amylase || undefined,
            isolationRegion: filters.isolationRegion || undefined,
            biochemistry: filters.biochemistry || undefined,
            iuk: filters.iuk || undefined,
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
    }, [search, filters, page, sortBy, sortOrder])

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
                <div className="relative flex-1 min-w-[220px] max-w-sm">
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
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{t('sort')}</span>
                        <select
                            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value as 'createdAt' | 'identifier' | 'sampleCode' | 'taxonomy16s'); setPage(1); }}
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
                    <Button size="sm" onClick={() => router.push(`/strains/new?returnTo=${encodeURIComponent(returnPath)}`)}>
                        {t('create')}
                    </Button>
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
                        <Input
                            placeholder={t('genomePlaceholder')}
                            value={filters.genome}
                            onChange={(e) => { setFilters({ ...filters, genome: e.target.value }); setPage(1); }}
                        />
                        <Input
                            placeholder={t('antibioticActivityPlaceholder')}
                            value={filters.antibioticActivity}
                            onChange={(e) => { setFilters({ ...filters, antibioticActivity: e.target.value }); setPage(1); }}
                        />
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="hasGenome"
                                checked={filters.hasGenome}
                                onCheckedChange={(checked) => { setFilters({ ...filters, hasGenome: checked === true }); setPage(1); }}
                            />
                            <label htmlFor="hasGenome" className="text-sm">{t('hasGenome')}</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="seq"
                                checked={filters.seq}
                                onCheckedChange={(checked) => { setFilters({ ...filters, seq: checked === true }); setPage(1); }}
                            />
                            <label htmlFor="seq" className="text-sm">{t('sequenced')}</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="phosphates"
                                checked={filters.phosphates}
                                onCheckedChange={(checked) => { setFilters({ ...filters, phosphates: checked === true }); setPage(1); }}
                            />
                            <label htmlFor="phosphates" className="text-sm">{t('phosphates')}</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="siderophores"
                                checked={filters.siderophores}
                                onCheckedChange={(checked) => { setFilters({ ...filters, siderophores: checked === true }); setPage(1); }}
                            />
                            <label htmlFor="siderophores" className="text-sm">{t('siderophores')}</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="pigmentSecretion"
                                checked={filters.pigmentSecretion}
                                onCheckedChange={(checked) => { setFilters({ ...filters, pigmentSecretion: checked === true }); setPage(1); }}
                            />
                            <label htmlFor="pigmentSecretion" className="text-sm">{t('pigmentSecretion')}</label>
                        </div>
                        <Select
                            value={filters.gramStain}
                            onValueChange={(value) => { setFilters({ ...filters, gramStain: value === "ALL" ? "" : value }); setPage(1); }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('anyGramStain')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">{t('anyGramStain')}</SelectItem>
                                <SelectItem value="POSITIVE">{t('gramPositive')}</SelectItem>
                                <SelectItem value="NEGATIVE">{t('gramNegative')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.amylase}
                            onValueChange={(value) => { setFilters({ ...filters, amylase: value === "ALL" ? "" : value }); setPage(1); }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('amylase')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">{t('anyAmylase')}</SelectItem>
                                <SelectItem value="POSITIVE">{t('positive')}</SelectItem>
                                <SelectItem value="NEGATIVE">{t('negative')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.isolationRegion}
                            onValueChange={(value) => { setFilters({ ...filters, isolationRegion: value === "ALL" ? "" : value }); setPage(1); }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('isolationRegion')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">{t('anyRegion')}</SelectItem>
                                <SelectItem value="RHIZOSPHERE">{t('rhizosphere')}</SelectItem>
                                <SelectItem value="ENDOSPHERE">{t('endosphere')}</SelectItem>
                                <SelectItem value="PHYLLOSPHERE">{t('phyllosphere')}</SelectItem>
                                <SelectItem value="SOIL">{t('soil')}</SelectItem>
                                <SelectItem value="OTHER">{t('other')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder={t('biochemistryPlaceholder')}
                            value={filters.biochemistry}
                            onChange={(e) => { setFilters({ ...filters, biochemistry: e.target.value }); setPage(1); }}
                        />
                        <Input
                            placeholder={t('iukPlaceholder')}
                            value={filters.iuk}
                            onChange={(e) => { setFilters({ ...filters, iuk: e.target.value }); setPage(1); }}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setFilters({
                                    sampleCode: "",
                                    taxonomy: "",
                                    genome: "",
                                    hasGenome: false,
                                    antibioticActivity: "",
                                    seq: false,
                                    gramStain: "",
                                    phosphates: false,
                                    siderophores: false,
                                    pigmentSecretion: false,
                                    amylase: "",
                                    isolationRegion: "",
                                    biochemistry: "",
                                    iuk: "",
                                });
                                setPage(1);
                            }}
                        >
                            {t('reset')}
                        </Button>
                    </div>
                </Card>
            )}

            <Card>
                <CardHeader className="p-4">
                    <CardTitle className="text-lg">{t('title')}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">{t('identifier')}</TableHead>
                                <TableHead>{t('sampleSource')}</TableHead>
                                {showTaxonomy && <TableHead>{t('taxonomy16s')}</TableHead>}
                                {showGrowth && <TableHead>{t('gramStain')}</TableHead>}
                                {showGrowth && <TableHead>{t('characteristics')}</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {strains.map((strain) => (
                                <TableRow
                                    key={strain.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => router.push(`/strains/${strain.id}?returnTo=${encodeURIComponent(returnPath)}`)}
                                >
                                    <TableCell className="font-medium">
                                        {strain.identifier}
                                        {strain.seq && (
                                            <Badge variant="secondary" className="ml-2 text-[10px]">{t('seqBadge')}</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>{strain.sample?.code || '-'}</TableCell>

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
                                            {strain.gramStain === 'POSITIVE' && <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">{t('gramPosBadge')}</Badge>}
                                            {strain.gramStain === 'NEGATIVE' && <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">{t('gramNegBadge')}</Badge>}
                                        </TableCell>
                                    )}

                                    {showGrowth && (
                                        <TableCell>
                                            <div className="flex gap-1 flex-wrap">
                                                {strain.phosphates && <Badge variant="secondary" className="text-[10px]">{t('pPosBadge')}</Badge>}
                                                {strain.siderophores && <Badge variant="secondary" className="text-[10px]">{t('sidPosBadge')}</Badge>}
                                                {strain.pigmentSecretion && <Badge variant="secondary" className="text-[10px]">{t('pigmentBadge')}</Badge>}
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
