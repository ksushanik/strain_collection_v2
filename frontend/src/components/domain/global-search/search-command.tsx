"use client"

import * as React from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Command, CommandInput } from "@/components/ui/command"
import { DialogTitle } from "@/components/ui/dialog"

type SearchCommandProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  query: string
  onQueryChange: (query: string) => void
  placeholder: string
  children: React.ReactNode
}

export function SearchCommand({
  open,
  onOpenChange,
  title,
  query,
  onQueryChange,
  placeholder,
  children,
}: SearchCommandProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <Command
          shouldFilter={false}
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
        >
          <CommandInput
            placeholder={placeholder}
            value={query}
            onValueChange={onQueryChange}
          />
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}
