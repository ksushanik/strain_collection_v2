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
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"

interface StrainListProps {
    enabledPacks: string[]
    returnPath?: string
}

export function StrainList({ enabledPacks, returnPath = "/strains" }: StrainListProps) {
    const router = useRouter()
    const [strains, setStrains] = React.useState<Strain[]>([])
    const [meta, setMeta] = React.useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [search, setSearch] = React.useState("")
    const [page, setPage] = React.useState(1)
    const [filtersOpen, setFiltersOpen] = React.useState(false)
    const [filters, setFilters] = React.useState({
        sampleCode: "",
        taxonomy: "",
        genome: "",
        hasGenome: false,
        antibioticActivity: "",
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
            page,
            limit: 10,
        }).then(res => {
            setStrains(res.data)
            setMeta(res.meta)
            setLoading(false)
        }).catch(err => {
            console.error('Failed to load strains:', err)
            setLoading(false)
        })
    }, [search, filters, page])

    // --- Field Pack Logic ---
    const showTaxonomy = enabledPacks.includes("taxonomy")
    const showGrowth = enabledPacks.includes("growth_characteristics")

    if (loading) {
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
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search strains..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant={filtersOpen ? "default" : "outline"} size="sm" onClick={() => setFiltersOpen((v) => !v)}>
                        <Filter className="mr-2 h-4 w-4" />
                        Filters
                    </Button>
                    <Button size="sm" onClick={() => router.push(`/strains/new?returnTo=${encodeURIComponent(returnPath)}`)}>
                        Create Strain
                    </Button>
                </div>
            </div>

            {filtersOpen && (
                <Card className="p-3 space-y-2">
                    <div className="grid gap-2 md:grid-cols-3">
                        <Input
                            placeholder="Sample code"
                            value={filters.sampleCode}
                            onChange={(e) => { setFilters({ ...filters, sampleCode: e.target.value }); setPage(1); }}
                        />
                        <Input
                            placeholder="Taxonomy or text search"
                            value={filters.taxonomy}
                            onChange={(e) => { setFilters({ ...filters, taxonomy: e.target.value }); setPage(1); }}
                        />
                        <Input
                            placeholder="Genome contains"
                            value={filters.genome}
                            onChange={(e) => { setFilters({ ...filters, genome: e.target.value }); setPage(1); }}
                        />
                        <Input
                            placeholder="Antibiotic activity contains"
                            value={filters.antibioticActivity}
                            onChange={(e) => { setFilters({ ...filters, antibioticActivity: e.target.value }); setPage(1); }}
                        />
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="hasGenome"
                                checked={filters.hasGenome}
                                onCheckedChange={(checked) => { setFilters({ ...filters, hasGenome: checked === true }); setPage(1); }}
                            />
                            <label htmlFor="hasGenome" className="text-sm">Has genome</label>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setFilters({ sampleCode: "", taxonomy: "", genome: "", hasGenome: false, antibioticActivity: "" }); setPage(1); }}
                        >
                            Reset
                        </Button>
                    </div>
                </Card>
            )}

            <Card>
                <CardHeader className="p-4">
                    <CardTitle className="text-lg">All Strains</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Identifier</TableHead>
                                <TableHead>Sample Source</TableHead>
                                {showTaxonomy && <TableHead>Taxonomy (16S)</TableHead>}
                                {showGrowth && <TableHead>Gram Stain</TableHead>}
                                {showGrowth && <TableHead>Characteristics</TableHead>}
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
                                            <Badge variant="secondary" className="ml-2 text-[10px]">SEQ</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>{strain.sample?.code || '-'}</TableCell>

                                    {showTaxonomy && (
                                        <TableCell>
                                            {strain.taxonomy16s ? (
                                                <span className="italic">
                                                    {(strain.taxonomy16s as any)?.genus} {(strain.taxonomy16s as any)?.species}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                    )}

                                    {showGrowth && (
                                        <TableCell>
                                            {strain.gramStain === 'POSITIVE' && <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">Gram +</Badge>}
                                            {strain.gramStain === 'NEGATIVE' && <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">Gram -</Badge>}
                                        </TableCell>
                                    )}

                                    {showGrowth && (
                                        <TableCell>
                                            <div className="flex gap-1 flex-wrap">
                                                {strain.phosphates && <Badge variant="secondary" className="text-[10px]">P+</Badge>}
                                                {strain.siderophores && <Badge variant="secondary" className="text-[10px]">Sid+</Badge>}
                                                {strain.pigmentSecretion && <Badge variant="secondary" className="text-[10px]">Pigment</Badge>}
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
                    Page {meta?.page ?? 1} of {meta?.totalPages ?? 1} ({meta?.total ?? strains.length} total)
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
