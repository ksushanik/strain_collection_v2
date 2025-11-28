"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { ApiService } from "@/services/api"
import { useDebounce } from "@/hooks/use-debounce"

interface TaxonomyAutocompleteProps {
    value?: string
    onChange: (value: string) => void
    placeholder?: string
}

export function TaxonomyAutocomplete({ value, onChange, placeholder = "Search taxonomy..." }: TaxonomyAutocompleteProps) {
    const [open, setOpen] = React.useState(false)
    const [searchTerm, setSearchTerm] = React.useState("")
    const [results, setResults] = React.useState<Array<{ taxId: string; name: string; rank: string }>>([])
    const [loading, setLoading] = React.useState(false)

    // Debounce search term to avoid too many API calls
    const debouncedSearchTerm = useDebounce(searchTerm, 500)

    React.useEffect(() => {
        if (!debouncedSearchTerm) {
            setResults([])
            return
        }

        setLoading(true)
        ApiService.searchTaxonomy(debouncedSearchTerm)
            .then((data) => {
                setResults(data)
            })
            .catch((err) => {
                console.error("Taxonomy search failed", err)
                setResults([])
            })
            .finally(() => {
                setLoading(false)
            })
    }, [debouncedSearchTerm])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value || placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <div className="flex flex-col">
                    <div className="flex items-center border-b px-3">
                        <Input
                            placeholder="Type to search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border-0 focus-visible:ring-0 px-0"
                        />
                        {loading && <Loader2 className="h-4 w-4 animate-spin opacity-50" />}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto p-1">
                        {results.length === 0 && !loading && searchTerm && (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                No results found.
                            </div>
                        )}
                        {results.length === 0 && !searchTerm && (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                Start typing to search NCBI Taxonomy.
                            </div>
                        )}
                        {results.map((item) => (
                            <div
                                key={item.taxId}
                                className={cn(
                                    "relative flex cursor-default select-none items-start rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                    value === item.name && "bg-accent text-accent-foreground"
                                )}
                                onClick={() => {
                                    onChange(item.name)
                                    setOpen(false)
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4 mt-0.5",
                                        value === item.name ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium">{item.name}</span>
                                    <div className="flex items-center">
                                        <span className={cn(
                                            "text-xs px-2 py-0.5 rounded-full capitalize",
                                            item.rank === 'species'
                                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                        )}>
                                            {item.rank}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
