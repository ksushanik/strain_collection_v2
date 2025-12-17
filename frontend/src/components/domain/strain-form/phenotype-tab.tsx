import * as React from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { useTranslations } from "next-intl"
import { Plus, Trash2 } from "lucide-react"

import { ApiService, TraitDataType } from "@/services/api"
import type { TraitDefinition } from "@/services/api"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TraitSelect } from "@/components/domain/traits/trait-select"
import { getTraitDisplayName, getTraitOptionLabel, resolveTraitCodeFromName } from "@/lib/trait-labels"

type PhenotypeFormValue = {
  id?: number
  traitDefinitionId?: number | null
  traitName?: string
  result: string
  method?: string
  traitCode?: string | null
  dataType?: TraitDataType
  options?: string[] | null
  units?: string | null
  traitDefinition?: TraitDefinition | null
}

function getTraitDefFromPhenotype(p: PhenotypeFormValue) {
  return p.traitDefinition || undefined
}

function getCodeFromPhenotype(p: PhenotypeFormValue) {
  return p?.traitCode || getTraitDefFromPhenotype(p)?.code || null
}

function getDataTypeFromPhenotype(p: PhenotypeFormValue): TraitDataType {
  return p?.dataType || getTraitDefFromPhenotype(p)?.dataType || TraitDataType.TEXT
}

function getOptionsFromPhenotype(p: PhenotypeFormValue): string[] | undefined {
  const own = p?.options as string[] | null | undefined
  if (Array.isArray(own)) return own
  const nested: unknown = getTraitDefFromPhenotype(p)?.options
  return Array.isArray(nested) ? (nested as string[]) : undefined
}

function normalizeResultForDisplay(p: PhenotypeFormValue, t: (k: string) => string) {
  const code = getCodeFromPhenotype(p)
  const dataType = getDataTypeFromPhenotype(p)

  if (!p?.result || !String(p.result).trim()) return "-"

  if (dataType === TraitDataType.BOOLEAN) {
    return p.result === "true" ? t("yes") : "-"
  }

  if (dataType === TraitDataType.CATEGORICAL) {
    return getTraitOptionLabel(code, p.result, t)
  }

  return p.result
}

function hasDefinedValue(p: PhenotypeFormValue, resolvedTrait?: TraitDefinition | null) {
  const resultRaw = typeof p.result === "string" ? p.result.trim() : ""
  if (!resultRaw) return false

  // Back-compat: older payloads may store boolean as "false" while we don't have dataType on the object.
  if (resultRaw.toLowerCase() === "false") return false

  const dt = resolvedTrait?.dataType || getDataTypeFromPhenotype(p)
  if (dt === TraitDataType.BOOLEAN) return resultRaw.toLowerCase() === "true"
  return true
}

type EditorState = {
  open: boolean
  mode: "add" | "edit"
  index: number | null
  trait: TraitDefinition | null
  value: PhenotypeFormValue
}

function createEmptyValue(): PhenotypeFormValue {
  return {
    traitDefinitionId: null,
    traitName: "",
    traitCode: null,
    dataType: TraitDataType.TEXT,
    options: null,
    units: null,
    result: "",
    method: "",
  }
}

function buildValueFromTrait(trait: TraitDefinition, existing?: PhenotypeFormValue): PhenotypeFormValue {
  return {
    ...(existing || {}),
    traitDefinitionId: trait.id,
    traitName: trait.name,
    traitCode: trait.code,
    dataType: trait.dataType,
    options: (trait.options as unknown as string[] | null | undefined) ?? null,
    units: trait.units ?? null,
    method: existing?.method ?? trait.defaultMethod ?? "",
    result: existing?.result ?? "",
    traitDefinition: existing?.traitDefinition ?? null,
  }
}

type StrainFormValues = { phenotypes: PhenotypeFormValue[] }

export function StrainPhenotypeTab() {
  const t = useTranslations("Strains")
  const tCommon = useTranslations("Common")
  const { control, watch } = useFormContext<StrainFormValues>()

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: "phenotypes",
  })

  const phenotypes = (watch("phenotypes") || []) as PhenotypeFormValue[]

  const [dictionary, setDictionary] = React.useState<TraitDefinition[]>([])
  const [editor, setEditor] = React.useState<EditorState>({
    open: false,
    mode: "add",
    index: null,
    trait: null,
    value: createEmptyValue(),
  })

  React.useEffect(() => {
    ApiService.getTraitDictionary()
      .then(setDictionary)
      .catch(() => setDictionary([]))
  }, [])

  const byId = React.useMemo(() => {
    const map = new Map<number, TraitDefinition>()
    dictionary.forEach((d) => map.set(d.id, d))
    return map
  }, [dictionary])

  const byCode = React.useMemo(() => {
    const map = new Map<string, TraitDefinition>()
    dictionary.forEach((d) => map.set(d.code, d))
    return map
  }, [dictionary])

  const byName = React.useMemo(() => {
    const map = new Map<string, TraitDefinition>()
    dictionary.forEach((d) => map.set(d.name.trim().toLowerCase(), d))
    return map
  }, [dictionary])

  const resolveTraitForPhenotype = React.useCallback(
    (p: PhenotypeFormValue) => {
      const code = getCodeFromPhenotype(p)
      if (code && byCode.has(code)) return byCode.get(code) || null
      const id = p.traitDefinitionId
      if (typeof id === "number" && byId.has(id)) return byId.get(id) || null
      const name = (p.traitName || "").trim().toLowerCase()
      if (name && byName.has(name)) return byName.get(name) || null
      const legacyCode = resolveTraitCodeFromName(p.traitName)
      if (legacyCode && byCode.has(legacyCode)) return byCode.get(legacyCode) || null
      return null
    },
    [byCode, byId, byName],
  )

  const findPhenotypeIndex = React.useCallback(
    (trait: TraitDefinition) => {
      return phenotypes.findIndex((p) => {
        const code = getCodeFromPhenotype(p) || resolveTraitCodeFromName(p.traitName)
        if (code && code === trait.code) return true
        if (typeof p.traitDefinitionId === "number" && p.traitDefinitionId === trait.id) return true
        if (p.traitName && p.traitName === trait.name) return true
        return false
      })
    },
    [phenotypes],
  )

  const openEdit = React.useCallback(
    (trait: TraitDefinition, index: number | null) => {
      const existing = index !== null && index >= 0 ? phenotypes[index] : null
      const value = buildValueFromTrait(trait, existing || undefined)

      setEditor({
        open: true,
        mode: "edit",
        index,
        trait,
        value,
      })
    },
    [phenotypes],
  )

  const openAdd = React.useCallback(() => {
    setEditor({
      open: true,
      mode: "add",
      index: null,
      trait: null,
      value: createEmptyValue(),
    })
  }, [])

  const closeEditor = React.useCallback(() => {
    setEditor((s) => ({ ...s, open: false }))
  }, [])

  const saveEditor = React.useCallback(() => {
    const trait = editor.trait
    if (!trait) return

    const value = editor.value
    const dataType = trait.dataType

    // Treat empty as "unset": remove for custom traits; keep system traits row with empty value.
    const hasValue =
      dataType === TraitDataType.BOOLEAN
        ? value.result === "true"
        : typeof value.result === "string" && value.result.trim().length > 0

    const index = editor.index
    const existingIndex = index !== null ? index : findPhenotypeIndex(trait)

    if (!hasValue) {
      if (existingIndex >= 0) {
        remove(existingIndex)
      }
      closeEditor()
      return
    }

    if (existingIndex >= 0) {
      update(existingIndex, buildValueFromTrait(trait, value))
    } else {
      append(buildValueFromTrait(trait, value))
    }

    closeEditor()
  }, [append, closeEditor, editor, findPhenotypeIndex, remove, update])

  const deleteEditor = React.useCallback(() => {
    if (!editor.trait) return
    if (editor.trait.code === "gram_stain") return
    const index = editor.index
    if (index !== null && index >= 0) remove(index)
    closeEditor()
  }, [closeEditor, editor.index, editor.trait, remove])

  const addableTraits = React.useMemo(() => {
    const usedIds = new Set<number>()
    const usedCodes = new Set<string>()
    phenotypes.forEach((p) => {
      if (typeof p.traitDefinitionId === "number") usedIds.add(p.traitDefinitionId)
      const code = getCodeFromPhenotype(p)
      if (code) usedCodes.add(code)
    })
    return dictionary.filter((d) => !usedIds.has(d.id) && !usedCodes.has(d.code))
  }, [dictionary, phenotypes])

  const rows = React.useMemo(() => {
    const active = phenotypes
      .map((p, idx) => ({ p, idx, trait: resolveTraitForPhenotype(p) }))
      .filter(({ p, trait }) => hasDefinedValue(p, trait))

    active.sort((a, b) => {
      const an = a.trait?.name || a.p.traitName || ""
      const bn = b.trait?.name || b.p.traitName || ""
      // Gram stain first if present
      const codeA = getCodeFromPhenotype(a.p) || a.trait?.code
      const codeB = getCodeFromPhenotype(b.p) || b.trait?.code
      if (codeA === "gram_stain") return -1
      if (codeB === "gram_stain") return 1
      return an.localeCompare(bn)
    })

    return active
  }, [phenotypes, resolveTraitForPhenotype])

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-4 md:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">{t("growthAndTraits")}</h3>
            <p className="text-xs text-muted-foreground">{t("phenotypeDesc")}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={openAdd} disabled={addableTraits.length === 0}>
            <Plus className="mr-2 h-4 w-4" />
            {t("addTrait")}
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("traitName")}</TableHead>
                <TableHead>{t("traitResult")}</TableHead>
                <TableHead className="w-[1%]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-20 text-center text-muted-foreground">
                    {t("noTraitsAdded")}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map(({ p, idx, trait }) => {
                  const resolved = trait || resolveTraitForPhenotype(p) || null
                  const code = getCodeFromPhenotype(p) || resolved?.code || resolveTraitCodeFromName(p.traitName)
                  const rawName = trait?.name || p.traitName || "-"
                  const displayName = getTraitDisplayName(code, rawName, t)
                  const canRemove = code !== "gram_stain"

                  return (
                    <TableRow
                      key={fields[idx]?.id ?? `custom-${idx}`}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => resolved && openEdit(resolved, idx)}
                    >
                      <TableCell className="font-medium">{displayName}</TableCell>
                      <TableCell>{normalizeResultForDisplay(p, t)}</TableCell>
                      <TableCell>
                        {canRemove && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              remove(idx)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={editor.open} onOpenChange={(open) => (open ? null : closeEditor())}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>
              {editor.mode === "add" ? t("addTrait") : t("editTrait")}
            </DialogTitle>
            <DialogDescription>{t("phenotypeDesc")}</DialogDescription>
          </DialogHeader>

          {editor.mode === "add" && (
            <div className="grid gap-2">
              <Label>{t("traitName")}</Label>
              <TraitSelect
                onSelect={(trait) => {
                  const existingIdx = findPhenotypeIndex(trait)
                  if (existingIdx >= 0) {
                    openEdit(trait, existingIdx)
                    return
                  }
                  setEditor((s) => ({
                    ...s,
                    trait,
                    value: buildValueFromTrait(trait, s.value),
                  }))
                }}
              />
              <div className="text-[0.8rem] text-muted-foreground">
                {addableTraits.length === 0 ? t("noTraitsAdded") : ""}
              </div>
            </div>
          )}

          {editor.trait && (
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>{t("traitName")}</Label>
                <Input value={getTraitDisplayName(editor.trait.code, editor.trait.name, t)} disabled />
              </div>

              <div className="grid gap-2">
                <Label>{t("traitMethod")}</Label>
                <Input
                  value={editor.value.method || ""}
                  onChange={(e) => setEditor((s) => ({ ...s, value: { ...s.value, method: e.target.value } }))}
                  placeholder={t("methodPlaceholder") || "e.g. Microscopy"}
                />
              </div>

              <div className="grid gap-2">
                <Label>{t("traitResult")}</Label>

                {editor.trait.dataType === TraitDataType.BOOLEAN ? (
                  <div className="flex items-center gap-3 rounded-md border p-3">
                    <Checkbox
                      checked={editor.value.result === "true"}
                      onCheckedChange={(checked) =>
                        setEditor((s) => ({
                          ...s,
                          value: { ...s.value, result: checked === true ? "true" : "" },
                        }))
                      }
                    />
                    <div className="text-sm">{editor.value.result === "true" ? t("yes") : t("no")}</div>
                  </div>
                ) : editor.trait.dataType === TraitDataType.CATEGORICAL ? (
                  <Select
                    value={editor.value.result || ""}
                    onValueChange={(val) => setEditor((s) => ({ ...s, value: { ...s.value, result: val } }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectResult")} />
                    </SelectTrigger>
                    <SelectContent>
                      {(getOptionsFromPhenotype(editor.value) || []).map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {getTraitOptionLabel(editor.trait?.code, opt, t)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : editor.trait.code === "antibiotic_activity" ? (
                  <RichTextEditor
                    value={editor.value.result || ""}
                    onChange={(val) => setEditor((s) => ({ ...s, value: { ...s.value, result: val } }))}
                    placeholder={t("antibioticActivityPlaceholder")}
                  />
                ) : (
                  <Input
                    value={editor.value.result || ""}
                    onChange={(e) => setEditor((s) => ({ ...s, value: { ...s.value, result: e.target.value } }))}
                    placeholder={t("traitResultPlaceholder")}
                  />
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between sm:justify-between">
            {editor.mode === "edit" && editor.trait && editor.trait.code !== "gram_stain" ? (
              <Button type="button" variant="destructive" onClick={deleteEditor}>
                <Trash2 className="mr-2 h-4 w-4" />
                {tCommon("delete")}
              </Button>
            ) : (
              <span />
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={closeEditor}>
                {tCommon("cancel")}
              </Button>
              <Button type="button" onClick={saveEditor} disabled={!editor.trait}>
                {tCommon("save")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
