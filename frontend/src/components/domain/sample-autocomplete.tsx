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
import { Sample } from "@/types/api"
import { formatSampleCodeForDisplay } from "@/lib/sample-code"

interface SampleAutocompleteProps {
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    initialSample?: Pick<Sample, "id" | "code"> & Partial<Sample>
}

export function SampleAutocomplete({ value, onChange, placeholder = "Search sample...", initialSample }: SampleAutocompleteProps) {
    const [open, setOpen] = React.useState(false)
    const [searchTerm, setSearchTerm] = React.useState("")
    const [results, setResults] = React.useState<Sample[]>([])
    const [loading, setLoading] = React.useState(false)
    const [selectedSample, setSelectedSample] = React.useState<(Pick<Sample, "id" | "code"> & Partial<Sample>) | undefined>(initialSample)

    // Debounce search term to avoid too many API calls
    const debouncedSearchTerm = useDebounce(searchTerm, 500)

    React.useEffect(() => {
        if (!debouncedSearchTerm && !open) {
            return
        }

        setLoading(true)
        ApiService.getSamples({ search: debouncedSearchTerm, limit: 20 })
            .then((data) => {
                setResults(data.data)
            })
            .catch((err) => {
                console.error("Sample search failed", err)
                setResults([])
            })
            .finally(() => {
                setLoading(false)
            })
    }, [debouncedSearchTerm, open])

    // Update selected sample display if value changes externally or initially
    React.useEffect(() => {
        if (value && !selectedSample) {
            // If we have a value (ID) but no sample object, we might want to fetch it
            // For now, we rely on initialSample or the user selecting from the list
            // If initialSample matches the ID, use it
            if (initialSample && initialSample.id.toString() === value) {
                setSelectedSample(initialSample)
            }
        }
    }, [value, initialSample, selectedSample])


    const displayValue = selectedSample
        ? `${selectedSample.code} ${selectedSample.siteName ? `(${selectedSample.siteName})` : ""}`
        : value
            ? "Loading..." // Or some other placeholder if we have ID but no details yet
            : placeholder

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between",
                        !selectedSample && !value && "text-muted-foreground font-normal"
                    )}
                >
                    {displayValue}
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
                        {results.length === 0 && !searchTerm && !loading && (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                Start typing to search samples.
                            </div>
                        )}
                        {results.map((item) => (
                            <div
                                key={item.id}
                                className={cn(
                                    "relative flex cursor-default select-none items-start rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                    value === item.id.toString() && "bg-accent text-accent-foreground"
                                )}
                                onClick={() => {
                                    onChange(item.id.toString())
                                    setSelectedSample(item)
                                    setOpen(false)
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4 mt-0.5",
                                        value === item.id.toString() ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium">{formatSampleCodeForDisplay(item.code)}</span>
                                    {item.siteName && (
                                        <span className="text-xs text-muted-foreground">
                                            {item.siteName}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
