import * as React from "react"
import { useFormContext, useFieldArray } from "react-hook-form"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { TraitSelect } from "@/components/domain/traits/trait-select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TraitDataType } from "@/services/api"
import type { TraitDefinition } from "@/services/api"

interface PhenotypeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: any
    onSave: (data: any) => void
    onDelete?: () => void
}

function PhenotypeDialog({ open, onOpenChange, initialData, onSave, onDelete }: PhenotypeDialogProps) {
    const t = useTranslations('Strains')
    const tCommon = useTranslations('Common')
    const [data, setData] = React.useState<any>({})

    React.useEffect(() => {
        if (open) {
            if (initialData) {
                // When editing, initialData might come from backend where dataType is nested in traitDefinition
                // or from form state where it might be at top level
                const traitDef = initialData.traitDefinition
                setData({
                    ...initialData,
                    dataType: initialData.dataType || traitDef?.dataType || TraitDataType.TEXT,
                    options: initialData.options || traitDef?.options,
                    units: initialData.units || traitDef?.units
                })
            } else {
                setData({
                    traitDefinitionId: null,
                    traitName: "",
                    result: "",
                    dataType: TraitDataType.TEXT
                })
            }
        }
    }, [open, initialData])

    const handleTraitSelect = (trait: TraitDefinition) => {
        setData((prev: any) => ({
            ...prev,
            traitDefinitionId: trait.id,
            traitName: trait.name,
            dataType: trait.dataType,
            options: trait.options,
            units: trait.units,
            result: trait.dataType === TraitDataType.BOOLEAN ? "false" : ""
        }))
    }

    const renderResultInput = () => {
        const dataType = data.dataType || TraitDataType.TEXT
        const options = data.options as string[] | undefined
        const units = data.units as string | undefined

        switch (dataType) {
            case TraitDataType.BOOLEAN:
                return (
                    <div className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 h-10">
                        <Switch
                            checked={data.result === "true"}
                            onCheckedChange={(checked) => setData({ ...data, result: String(checked) })}
                        />
                        <div className="space-y-1 leading-none">
                            <Label>{data.result === "true" ? "Yes / Positive" : "No / Negative"}</Label>
                        </div>
                    </div>
                )

            case TraitDataType.CATEGORICAL:
                return (
                    <Select
                        value={data.result}
                        onValueChange={(val) => setData({ ...data, result: val })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select result" />
                        </SelectTrigger>
                        <SelectContent>
                            {options?.map((opt) => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )

            case TraitDataType.NUMERIC:
                return (
                    <div className="flex items-center space-x-2">
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={data.result}
                            onChange={(e) => setData({ ...data, result: e.target.value })}
                        />
                        {units && <Badge variant="secondary">{units}</Badge>}
                    </div>
                )

            default:
                return (
                    <Input
                        placeholder={t('traitResultPlaceholder')}
                        value={data.result || ""}
                        onChange={(e) => setData({ ...data, result: e.target.value })}
                    />
                )
        }
    }

    const handleSave = () => {
        if (!data.traitName || !data.result) return
        onSave(data)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{initialData ? t('editTrait') : t('addTrait')}</DialogTitle>
                    <DialogDescription>{t('phenotypeDesc')}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>{t('traitName')}</Label>
                        <TraitSelect
                            value={data.traitDefinitionId}
                            onSelect={handleTraitSelect}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>{t('traitResult')}</Label>
                        {renderResultInput()}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    {initialData && onDelete && (
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => {
                                onDelete()
                                onOpenChange(false)
                            }}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {tCommon('delete')}
                        </Button>
                    )}
                    <div className="flex gap-2">
                         <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            {tCommon('cancel')}
                        </Button>
                        <Button type="button" onClick={handleSave} disabled={!data.traitName || !data.result}>
                            {tCommon('save')}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function StrainPhenotypeTab() {
    const t = useTranslations('Strains')
    const { control, watch } = useFormContext()

    const { fields, append, update, remove } = useFieldArray({
        control,
        name: "phenotypes"
    })

    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [editingIndex, setEditingIndex] = React.useState<number | null>(null)

    // Watch fields to display in table
    const phenotypes = watch("phenotypes")

    const handleAdd = () => {
        setEditingIndex(null)
        setIsDialogOpen(true)
    }

    const handleEdit = (index: number) => {
        setEditingIndex(index)
        setIsDialogOpen(true)
    }

    const handleSave = (data: any) => {
        if (editingIndex !== null) {
            update(editingIndex, data)
        } else {
            append(data)
        }
    }

    const handleDelete = () => {
        if (editingIndex !== null) {
            remove(editingIndex)
        }
    }

    return (
        <div className="space-y-6">
            <div className="rounded-xl border bg-card p-4 md:p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold">{t('growthAndTraits')}</h3>
                        <p className="text-xs text-muted-foreground">{t('phenotypeDesc')}</p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAdd}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        {t('addTrait')}
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('traitName')}</TableHead>
                                <TableHead>{t('traitResult')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={2} className="h-24 text-center">
                                        {t('noTraitsAdded')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                fields.map((field, index) => {
                                    const trait = phenotypes?.[index] || {}
                                    // Extract data type from nested traitDefinition if not available at top level
                                    const traitDef = trait.traitDefinition
                                    const dataType = trait.dataType || traitDef?.dataType || TraitDataType.TEXT
                                    const units = trait.units || traitDef?.units

                                    return (
                                        <TableRow
                                            key={field.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => handleEdit(index)}
                                        >
                                            <TableCell className="font-medium">
                                                {trait.traitName || "—"}
                                            </TableCell>
                                            <TableCell>
                                                {dataType === TraitDataType.BOOLEAN ? (
                                                    trait.result === "true" ? "Yes / Positive" : "No / Negative"
                                                ) : (
                                                    trait.result || "—"
                                                )}
                                                {units && <span className="ml-1 text-muted-foreground text-xs">{units}</span>}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <PhenotypeDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                initialData={editingIndex !== null ? phenotypes?.[editingIndex] : null}
                onSave={handleSave}
                onDelete={editingIndex !== null ? handleDelete : undefined}
            />
        </div>
    )
}
