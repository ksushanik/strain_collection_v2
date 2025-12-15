import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ApiService } from "@/services/api"
import type { TraitDefinition } from "@/services/api"

interface TraitSelectProps {
  value?: number
  onSelect: (trait: TraitDefinition) => void
  disabled?: boolean
  className?: string
}

export function TraitSelect({ value, onSelect, disabled, className }: TraitSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [traits, setTraits] = React.useState<TraitDefinition[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    setLoading(true)
    ApiService.getTraitDictionary()
      .then(setTraits)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const selectedTrait = traits.find((t) => t.id === value)

  const groupedTraits = React.useMemo(() => {
    const groups: Record<string, TraitDefinition[]> = {}
    traits.forEach(trait => {
      const category = trait.category || "Uncategorized"
      if (!groups[category]) groups[category] = []
      groups[category].push(trait)
    })
    // Sort categories: Uncategorized last
    return Object.entries(groups).sort(([a], [b]) => {
      if (a === "Uncategorized") return 1
      if (b === "Uncategorized") return -1
      return a.localeCompare(b)
    })
  }, [traits])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled || loading}
        >
          {selectedTrait ? selectedTrait.name : "Select trait..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search traits..." />
          <CommandList>
            <CommandEmpty>No traits found.</CommandEmpty>
            {groupedTraits.map(([category, items]) => (
              <CommandGroup key={category} heading={category}>
                {items.map((trait) => (
                  <CommandItem
                    key={trait.id}
                    value={trait.name}
                    onSelect={() => {
                      onSelect(trait)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === trait.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{trait.name}</span>
                      <span className="text-xs text-muted-foreground">{trait.code}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
