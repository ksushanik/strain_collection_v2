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
import { useRouter } from "@/i18n/routing"
import { toast } from "sonner"
import { TaxonomyAutocomplete } from "./taxonomy-autocomplete"
import { useTranslations } from "next-intl"

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
    formId?: string
    showActions?: boolean
    onSubmittingChange?: (isSubmitting: boolean) => void
}

export function StrainForm({
    initialData,
    isEdit = false,
    returnTo,
    formId = "strain-form",
    showActions = true,
    onSubmittingChange,
}: StrainFormProps) {
    const router = useRouter()
    const t = useTranslations('Strains')
    const tCommon = useTranslations('Common')
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
                        setSampleOptions(() => {
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
        [form, initialData?.sample],
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
        onSubmittingChange?.(true)
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
                toast.success(t('strainUpdated'))
                router.back()
                router.refresh()
            } else {
                await ApiService.createStrain(payload)
                toast.success(t('strainCreated'))
                const target = returnTo || "/strains"
                router.push(target)
                router.refresh()
            }
        } catch (error) {
            console.error("Failed to save strain:", error)
            toast.error(t('failedToSaveStrain'))
        } finally {
            setLoading(false)
            onSubmittingChange?.(false)
        }
    }

    return (
        <Form {...form}>
            <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="rounded-xl border bg-card p-4 md:p-5 space-y-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-base font-semibold">{t('basics')}</h3>
                        <p className="text-xs text-muted-foreground">{t('basicsDesc')}</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="identifier"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('identifier')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('identifierPlaceholder')} {...field} />
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
                                    <FormLabel>{t('sourceSample')}</FormLabel>
                                    <div className="space-y-2">
                                        <Input
                                            placeholder={t('searchSamplePlaceholder')}
                                            value={sampleSearch}
                                            onChange={(e) => setSampleSearch(e.target.value)}
                                        />
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={loadingSamples ? t('loadingSamples') : t('selectSample')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {loadingSamples && (
                                                    <SelectItem value="loading" disabled>
                                                        <div className="flex items-center gap-2">
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            {tCommon('loading')}
                                                        </div>
                                                    </SelectItem>
                                                )}
                                                {!loadingSamples && sampleOptions.length === 0 && (
                                                    <SelectItem value="empty" disabled>
                                                        {t('noSamplesFound')}
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
                                    <FormLabel>{t('gramStain')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('selectResult')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="POSITIVE">{t('positive')}</SelectItem>
                                            <SelectItem value="NEGATIVE">{t('negative')}</SelectItem>
                                            <SelectItem value="VARIABLE">{t('variable')}</SelectItem>
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
                                    <FormLabel>{t('isolationRegion')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('selectRegion')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="RHIZOSPHERE">{t('rhizosphere')}</SelectItem>
                                            <SelectItem value="ENDOSPHERE">{t('endosphere')}</SelectItem>
                                            <SelectItem value="PHYLLOSPHERE">{t('phyllosphere')}</SelectItem>
                                            <SelectItem value="SOIL">{t('soil')}</SelectItem>
                                            <SelectItem value="OTHER">{t('other')}</SelectItem>
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
                                <FormLabel>{t('taxonomy16s')}</FormLabel>
                                <FormControl>
                                    <TaxonomyAutocomplete
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder={t('searchTaxonomyPlaceholder')}
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
                                <FormLabel>{t('otherIdentificationMethods')}</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder={t('otherTaxonomyPlaceholder')}
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>{t('nonDnaMethods')}</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="rounded-xl border bg-card p-4 md:p-5 space-y-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-base font-semibold">{t('growthAndTraits')}</h3>
                        <p className="text-xs text-muted-foreground">{t('growthAndTraitsDesc')}</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        <FormField
                            control={form.control}
                            name="amylase"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('amylase')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('selectResult')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="POSITIVE">{t('positive')}</SelectItem>
                                            <SelectItem value="NEGATIVE">{t('negative')}</SelectItem>
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
                                    <FormLabel>{t('iukIaa')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('iukPlaceholder')} {...field} />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        {t('auxinProduction')}
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
                                    <FormLabel>{t('antibioticActivity')}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t('antibioticActivityPlaceholder')}
                                            className="resize-none min-h-[96px]"
                                            {...field}
                                        />
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
                                        <FormLabel className="text-sm">{t('sequenced')}</FormLabel>
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
                                        <FormLabel className="text-sm">{t('phosphates')}</FormLabel>
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
                                        <FormLabel className="text-sm">{t('siderophores')}</FormLabel>
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
                                        <FormLabel className="text-sm">{t('pigmentSecretion')}</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-4 md:p-5 space-y-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-base font-semibold">{t('geneticsAndBiochemistry')}</h3>
                        <p className="text-xs text-muted-foreground">{t('geneticsAndBiochemistryDesc')}</p>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="genome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('genome')}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t('genomePlaceholder')}
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
                                    <FormLabel>{t('biochemistry')}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t('biochemistryPlaceholder')}
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
                        <h3 className="text-base font-semibold">{t('notes')}</h3>
                        <p className="text-xs text-muted-foreground">{t('notesDesc')}</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="features"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('features')}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t('featuresPlaceholder')}
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
                                    <FormLabel>{t('comments')}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t('commentsPlaceholder')}
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
                        <h3 className="text-base font-semibold">{t('indexing')}</h3>
                        <p className="text-xs text-muted-foreground">{t('indexingDesc')}</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="indexerInitials"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('indexerInitials')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('indexerInitialsPlaceholder')} {...field} />
                                    </FormControl>
                                    <FormDescription>{t('indexerDesc')}</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="collectionRcam"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('collectionRcam')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('collectionRcamPlaceholder')} {...field} />
                                    </FormControl>
                                    <FormDescription>{t('repositoryAccession')}</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {showActions && (
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
                            {tCommon('cancel')}
                        </Button>
                        <Button type="submit" disabled={loading} form={formId}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEdit ? t('updateStrain') : t('createStrain')}
                        </Button>
                    </div>
                )}
            </form>
        </Form>
    )
}
