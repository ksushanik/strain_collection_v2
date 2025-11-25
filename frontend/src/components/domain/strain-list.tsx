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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="seq"
                                checked={filters.seq}
                                onCheckedChange={(checked) => { setFilters({ ...filters, seq: checked === true }); setPage(1); }}
                            />
                            <label htmlFor="seq" className="text-sm">Sequenced</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="phosphates"
                                checked={filters.phosphates}
                                onCheckedChange={(checked) => { setFilters({ ...filters, phosphates: checked === true }); setPage(1); }}
                            />
                            <label htmlFor="phosphates" className="text-sm">Phosphates</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="siderophores"
                                checked={filters.siderophores}
                                onCheckedChange={(checked) => { setFilters({ ...filters, siderophores: checked === true }); setPage(1); }}
                            />
                            <label htmlFor="siderophores" className="text-sm">Siderophores</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="pigmentSecretion"
                                checked={filters.pigmentSecretion}
                                onCheckedChange={(checked) => { setFilters({ ...filters, pigmentSecretion: checked === true }); setPage(1); }}
                            />
                            <label htmlFor="pigmentSecretion" className="text-sm">Pigment</label>
                        </div>
                        <Select
                            value={filters.gramStain}
                            onValueChange={(value) => { setFilters({ ...filters, gramStain: value === "ALL" ? "" : value }); setPage(1); }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Any Gram Stain" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Any Gram Stain</SelectItem>
                                <SelectItem value="POSITIVE">Gram Positive</SelectItem>
                                <SelectItem value="NEGATIVE">Gram Negative</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.amylase}
                            onValueChange={(value) => { setFilters({ ...filters, amylase: value === "ALL" ? "" : value }); setPage(1); }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Amylase" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Any Amylase</SelectItem>
                                <SelectItem value="POSITIVE">Positive</SelectItem>
                                <SelectItem value="NEGATIVE">Negative</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.isolationRegion}
                            onValueChange={(value) => { setFilters({ ...filters, isolationRegion: value === "ALL" ? "" : value }); setPage(1); }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Isolation Region" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Any Region</SelectItem>
                                <SelectItem value="RHIZOSPHERE">Rhizosphere</SelectItem>
                                <SelectItem value="ENDOSPHERE">Endosphere</SelectItem>
                                <SelectItem value="PHYLLOSPHERE">Phyllosphere</SelectItem>
                                <SelectItem value="SOIL">Soil</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Biochemistry contains"
                            value={filters.biochemistry}
                            onChange={(e) => { setFilters({ ...filters, biochemistry: e.target.value }); setPage(1); }}
                        />
                        <Input
                            placeholder="IUK contains"
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
                                                    {(strain.taxonomy16s as { genus?: string; species?: string })?.genus} {(strain.taxonomy16s as { genus?: string; species?: string })?.species}
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
