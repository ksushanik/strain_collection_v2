"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ApiService, Strain } from "@/services/api"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { TaxonomyAutocomplete } from "./taxonomy-autocomplete"

const strainSchema = z.object({
    identifier: z.string().min(1, "Identifier is required"),
    sampleId: z.string().min(1, "Sample is required"),
    taxonomy16s: z.string().optional(),
    otherTaxonomy: z.string().optional(),
    indexerInitials: z.string().optional(),
    collectionRcam: z.string().optional(),
    gramStain: z.string().optional(),
    seq: z.boolean(),
    genome: z.string().optional(),
    biochemistry: z.string().optional(),
    antibioticActivity: z.string().optional(),
    iuk: z.string().optional(),
    phosphates: z.boolean(),
    siderophores: z.boolean(),
    pigmentSecretion: z.boolean(),
    amylase: z.string().optional(),
    isolationRegion: z.string().optional(),
    features: z.string().optional(),
    comments: z.string().optional(),
})

type StrainFormValues = z.infer<typeof strainSchema>

interface StrainFormProps {
    initialData?: Strain
    isEdit?: boolean
    returnTo?: string
}

export function StrainForm({ initialData, isEdit = false, returnTo }: StrainFormProps) {
    const router = useRouter()
    const [sampleOptions, setSampleOptions] = React.useState<Array<{ id: number; code: string; siteName?: string; sampleType?: string }>>([])
    const [sampleSearch, setSampleSearch] = React.useState("")
    const [loadingSamples, setLoadingSamples] = React.useState(false)
    const [loading, setLoading] = React.useState(false)

    const form = useForm<StrainFormValues>({
        resolver: zodResolver(strainSchema),
        defaultValues: {
            identifier: initialData?.identifier || "",
            sampleId: initialData?.sampleId?.toString() || undefined,
            taxonomy16s: initialData?.taxonomy16s || "",
            otherTaxonomy: initialData?.otherTaxonomy || "",
            indexerInitials: initialData?.indexerInitials || "",
            collectionRcam: initialData?.collectionRcam || "",
            gramStain: initialData?.gramStain || undefined,
            seq: initialData?.seq || false,
            genome: initialData?.genome || "",
            biochemistry: initialData?.biochemistry || "",
            antibioticActivity: initialData?.antibioticActivity || "",
            iuk: initialData?.iuk || "",
            phosphates: initialData?.phosphates || false,
            siderophores: initialData?.siderophores || false,
            pigmentSecretion: initialData?.pigmentSecretion || false,
            amylase: initialData?.amylase || "",
            isolationRegion: initialData?.isolationRegion || "",
            features: initialData?.features || "",
            comments: initialData?.comments || "",
        },
    })

    const loadSamples = React.useCallback(
        async (search?: string) => {
            setLoadingSamples(true)
            try {
                const res = await ApiService.getSamples({
                    limit: 20,
                    search: search?.trim() || undefined,
                })
                const options =
                    res.data?.map((sample) => ({
                        id: sample.id,
                        code: sample.code,
                        siteName: sample.siteName,
                        sampleType: sample.sampleType,
                    })) || []

                const currentId = form.getValues("sampleId")
                if (currentId) {
                    const currentNumeric = parseInt(currentId)
                    const exists = options.some((opt) => opt.id === currentNumeric)
                    if (!exists) {
                        const fallback =
                            initialData?.sample && initialData.sample.id === currentNumeric
                                ? {
                                    id: initialData.sample.id,
                                    code: initialData.sample.code,
                                    siteName: initialData.sample.siteName || 'Unknown site',
                                    sampleType: 'UNKNOWN',
                                  }
                                : undefined
                        setSampleOptions((prev) => {
                            const merged = [...options]
                            if (fallback) merged.unshift(fallback)
                            return merged
                        })
                        return
                    }
                }
                setSampleOptions(options)
            } catch (error) {
                console.error(error)
            } finally {
                setLoadingSamples(false)
            }
        },
        [form, initialData?.sample?.id, initialData?.sample?.code, initialData?.sample?.siteName],
    )

    React.useEffect(() => {
        loadSamples()
    }, [loadSamples])

    React.useEffect(() => {
        const handle = setTimeout(() => {
            loadSamples(sampleSearch)
        }, 300)
        return () => clearTimeout(handle)
    }, [sampleSearch, loadSamples])

    async function onSubmit(data: StrainFormValues) {
        setLoading(true)
        try {
            const payload = {
                ...data,
                sampleId: data.sampleId ? parseInt(data.sampleId) : undefined,
                gramStain: data.gramStain || undefined,
                amylase: data.amylase || undefined,
                isolationRegion: data.isolationRegion || undefined,
                features: data.features || undefined,
                comments: data.comments || undefined,
                taxonomy16s: data.taxonomy16s || undefined,
                otherTaxonomy: data.otherTaxonomy || undefined,
                indexerInitials: data.indexerInitials || undefined,
                collectionRcam: data.collectionRcam || undefined,
                genome: data.genome || undefined,
                biochemistry: data.biochemistry || undefined,
                antibioticActivity: data.antibioticActivity || undefined,
                iuk: data.iuk || undefined,
            }

            if (isEdit && initialData) {
                await ApiService.updateStrain(initialData.id, payload)
                toast.success("Strain updated successfully")
                router.back()
                router.refresh()
            } else {
                await ApiService.createStrain(payload)
                toast.success("Strain created successfully")
                const target = returnTo || "/strains"
                router.push(target)
                router.refresh()
            }
        } catch (error) {
            console.error("Failed to save strain:", error)
            toast.error("Failed to save strain. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="rounded-xl border bg-card p-4 md:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold">Basics</h3>
                        <p className="text-xs text-muted-foreground">Core identifiers & origin</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="identifier"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Identifier</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. STR-2024-001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="sampleId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Source Sample</FormLabel>
                                    <div className="space-y-2">
                                        <Input
                                            placeholder="Search by code or site..."
                                            value={sampleSearch}
                                            onChange={(e) => setSampleSearch(e.target.value)}
                                        />
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={loadingSamples ? "Loading samples..." : "Select a sample"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {loadingSamples && (
                                                    <SelectItem value="loading" disabled>
                                                        <div className="flex items-center gap-2">
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            Loading...
                                                        </div>
                                                    </SelectItem>
                                                )}
                                                {!loadingSamples && sampleOptions.length === 0 && (
                                                    <SelectItem value="empty" disabled>
                                                        No samples found
                                                    </SelectItem>
                                                )}
                                                {!loadingSamples &&
                                                    sampleOptions.map((sample) => (
                                                        <SelectItem key={sample.id} value={sample.id.toString()}>
                                                            {sample.code} {sample.siteName ? `(${sample.siteName})` : ""}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="gramStain"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gram Stain</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select result" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="POSITIVE">Positive (+)</SelectItem>
                                            <SelectItem value="NEGATIVE">Negative (-)</SelectItem>
                                            <SelectItem value="VARIABLE">Variable</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isolationRegion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Isolation Region</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select region" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="RHIZOSPHERE">Rhizosphere</SelectItem>
                                            <SelectItem value="ENDOSPHERE">Endosphere</SelectItem>
                                            <SelectItem value="PHYLLOSPHERE">Phyllosphere</SelectItem>
                                            <SelectItem value="SOIL">Soil</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="taxonomy16s"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Taxonomy (16S)</FormLabel>
                                <FormControl>
                                    <TaxonomyAutocomplete
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Search NCBI Taxonomy (e.g. Bacillus subtilis)..."
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="otherTaxonomy"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Other Identification Methods</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="e.g. Biochemical tests, morphological characteristics..."
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>Non-DNA/RNA based identification methods</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="rounded-xl border bg-card p-4 md:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold">Growth & Traits</h3>
                        <p className="text-xs text-muted-foreground">Quick toggles and enzymes</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        <FormField
                            control={form.control}
                            name="amylase"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amylase</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select result" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="POSITIVE">Positive (+)</SelectItem>
                                            <SelectItem value="NEGATIVE">Negative (-)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="iuk"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>IUK / IAA</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Indole acetic acid production..." {...field} />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Auxin/IAA production
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="antibioticActivity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Antibiotic Activity</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. active vs E. coli" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <FormField
                            control={form.control}
                            name="seq"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border bg-muted/30 p-3">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm">Sequenced (SEQ)</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phosphates"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border bg-muted/30 p-3">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm">Phosphates</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="siderophores"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border bg-muted/30 p-3">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm">Siderophores</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="pigmentSecretion"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border bg-muted/30 p-3">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm">Pigment Secretion</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-4 md:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold">Genetics & Biochemistry</h3>
                        <p className="text-xs text-muted-foreground">Genomic context and assays</p>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="genome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Genome</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Assembly info, accession numbers..."
                                            className="resize-none min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="biochemistry"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Biochemistry</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Biochemical tests, metabolic capabilities..."
                                            className="resize-none min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-4 md:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold">Notes</h3>
                        <p className="text-xs text-muted-foreground">Context and free-form notes</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="features"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Features</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe any special features..."
                                            className="resize-none min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="comments"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Comments</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Additional notes..."
                                            className="resize-none min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-4 md:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold">Indexing</h3>
                        <p className="text-xs text-muted-foreground">Who cataloged this strain</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="indexerInitials"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Indexer Initials</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. AB, JS" {...field} />
                                    </FormControl>
                                    <FormDescription>Person who isolated this strain</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="collectionRcam"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Collection RCAM</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. RCAM-12345" {...field} />
                                    </FormControl>
                                    <FormDescription>Repository accession number</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => {
                            if (returnTo) {
                                router.push(returnTo)
                            } else {
                                router.back()
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? "Update Strain" : "Create Strain"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
