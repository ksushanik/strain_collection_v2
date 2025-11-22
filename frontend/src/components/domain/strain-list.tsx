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

interface StrainListProps {
    enabledPacks: string[]
    returnPath?: string
}

export function StrainList({ enabledPacks, returnPath = "/strains" }: StrainListProps) {
    const router = useRouter()
    const [strains, setStrains] = React.useState<Strain[]>([])
    const [loading, setLoading] = React.useState(true)
    const [search, setSearch] = React.useState("")

    React.useEffect(() => {
        ApiService.getStrains().then(data => {
            setStrains(data)
            setLoading(false)
        }).catch(err => {
            console.error('Failed to load strains:', err)
            setLoading(false)
        })
    }, [])

    // --- Field Pack Logic ---
    const showTaxonomy = enabledPacks.includes("taxonomy")
    const showGrowth = enabledPacks.includes("growth_characteristics")

    const filteredStrains = strains.filter(s =>
        s.identifier.toLowerCase().includes(search.toLowerCase()) ||
        (s.sample?.code && s.sample.code.toLowerCase().includes(search.toLowerCase()))
    )

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search strains..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                </Button>
                <Button size="sm" onClick={() => router.push(`/strains/new?returnTo=${encodeURIComponent(returnPath)}`)}>
                    Create Strain
                </Button>
            </div>

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
                            {filteredStrains.map((strain) => (
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
        </div>
    )
}
