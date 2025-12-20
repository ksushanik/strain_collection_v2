"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ApiService, Strain, CreateStrainInput, TraitDataType } from "@/services/api"
import { Button } from "@/components/ui/button"
import {
    Form,
} from "@/components/ui/form"
import { Loader2 } from "lucide-react"
import { useRouter } from "@/i18n/routing"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StrainPassportTab } from "./strain-form/passport-tab"
import { StrainPhenotypeTab } from "./strain-form/phenotype-tab"
import { StrainGeneticsTab } from "./strain-form/genetics-tab"
import { SubmitErrorHandler, SubmitHandler } from "react-hook-form"

const strainSchema = z.object({
    identifier: z.string().min(1, "Identifier is required"),
    sampleId: z.string().min(1, "Sample is required"),
    
    // Refactoring v2 Fields
    ncbiScientificName: z.string().optional(),
    ncbiTaxonomyId: z.number().nullable().optional(),
    biosafetyLevel: z.enum(["BSL_1", "BSL_2", "BSL_3", "BSL_4"]).nullable().optional(),

    // Legacy Fields (kept for compatibility)
    features: z.string().optional(),
    comments: z.string().optional(),
    taxonomy16s: z.string().optional(),
    indexerInitials: z.string().optional(),
    collectionRcam: z.string().optional(),
    otherTaxonomy: z.string().optional(),
    isolationRegion: z.enum(["RHIZOSPHERE", "ENDOSPHERE", "PHYLLOSPHERE", "SOIL", "OTHER"]).nullable().optional(),

    // Dynamic Traits (may be present but unset in UI; unset entries are ignored on submit)
    phenotypes: z.array(
        z.object({
            traitDefinitionId: z.number().optional().nullable(),
            traitName: z.string().optional().nullable(),
            traitCode: z.string().optional().nullable(),
            result: z.string().optional().nullable(),
            method: z.string().optional().nullable(),
            dataType: z.nativeEnum(TraitDataType).optional(),
            options: z.array(z.string()).optional().nullable(),
            units: z.string().optional().nullable(),
        }),
    ).optional(),

    // Genetics
    genetics: z.object({
        wgsStatus: z.enum(["NONE", "PLANNED", "SEQUENCED", "ASSEMBLED", "PUBLISHED"]).optional(),
        assemblyAccession: z.string().optional(),
        marker16sSequence: z.string().optional(),
        marker16sAccession: z.string().optional(),
    }).optional(),
})

type StrainFormValues = z.infer<typeof strainSchema>

const ISOLATION_REGION_VALUES = ["RHIZOSPHERE", "ENDOSPHERE", "PHYLLOSPHERE", "SOIL", "OTHER"] as const
type IsolationRegion = (typeof ISOLATION_REGION_VALUES)[number]

function isIsolationRegion(value: unknown): value is IsolationRegion {
    return typeof value === "string" && (ISOLATION_REGION_VALUES as readonly string[]).includes(value)
}

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

    const [loading, setLoading] = React.useState(false)
    const [activeTab, setActiveTab] = React.useState<"passport" | "phenotype" | "genetics">("passport")

    const form = useForm<StrainFormValues>({
        resolver: zodResolver(strainSchema),
        defaultValues: {
            identifier: initialData?.identifier || "",
            sampleId: initialData?.sampleId?.toString() || undefined,
            
            // New fields defaults
            ncbiScientificName: initialData?.ncbiScientificName || "",
            ncbiTaxonomyId: initialData?.ncbiTaxonomyId ?? null,
            biosafetyLevel: initialData?.biosafetyLevel ?? null,
            
            // Legacy defaults
            features: initialData?.features || "",
            comments: initialData?.comments || "",
            taxonomy16s: initialData?.taxonomy16s || "",
            indexerInitials: initialData?.indexerInitials || "",
            collectionRcam: initialData?.collectionRcam || "",
            otherTaxonomy: initialData?.otherTaxonomy || "",
            isolationRegion: isIsolationRegion(initialData?.isolationRegion) ? initialData?.isolationRegion : null,

            phenotypes: initialData?.phenotypes || [],
            genetics: initialData?.genetics || { wgsStatus: "NONE" },
        },
    })

    const onSubmit: SubmitHandler<StrainFormValues> = async (data) => {
        setLoading(true)
        onSubmittingChange?.(true)
        try {
            const trimmedScientificName = (data.ncbiScientificName ?? "").trim()
            const payload: CreateStrainInput = {
                ...data,
                sampleId: data.sampleId ? parseInt(data.sampleId) : undefined,
                ncbiScientificName: trimmedScientificName.length > 0 ? trimmedScientificName : null,
                // Clean up optional fields
                genetics: data.genetics?.wgsStatus === "NONE" && !data.genetics.marker16sSequence ? undefined : data.genetics,
                phenotypes: data.phenotypes
                    ?.filter((p) => {
                        const result = (p.result ?? "").trim()
                        if (!result) return false
                        const hasTraitRef = (p.traitDefinitionId ?? null) !== null || !!(p.traitName ?? "").trim()
                        if (!hasTraitRef) return false
                        const traitCode = p.traitCode ?? undefined
                        const traitName = (p.traitName ?? "").trim().toLowerCase()
                        const isKnownBooleanLegacy =
                            traitName === "phosphate solubilization" ||
                            traitName === "siderophore production" ||
                            traitName === "pigment secretion" ||
                            traitName === "sequenced (seq)"

                        if (result === "-" && (p.dataType === TraitDataType.BOOLEAN || isKnownBooleanLegacy || traitCode === "phosphate_solubilization" || traitCode === "siderophore_production" || traitCode === "pigment_secretion" || traitCode === "sequenced_seq")) {
                            return false
                        }
                        return true
                    })
                    .map(({ traitDefinitionId, traitName, result, method }) => ({
                        traitDefinitionId: traitDefinitionId ?? undefined,
                        traitName: (traitName ?? "").trim(),
                        result: (result ?? "").trim(),
                        method: method ?? undefined,
                    })),
            }

            if (isEdit && initialData) {
                await ApiService.updateStrain(initialData.id, payload)
                toast.success(t('strainUpdated'))
                const basePath = `/strains/${initialData.id}`
                const target = returnTo
                    ? `${basePath}?returnTo=${encodeURIComponent(returnTo)}`
                    : basePath
                router.push(target)
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

    const onInvalid: SubmitErrorHandler<StrainFormValues> = (errors) => {
        if (errors.phenotypes) {
            setActiveTab("phenotype")
            toast.error(t("phenotypeHasErrors"))
            return
        }
        if (errors.genetics) {
            setActiveTab("genetics")
            toast.error(t("geneticsHasErrors"))
            return
        }
        setActiveTab("passport")
        if (errors.identifier) {
            toast.error(t("identifierRequiredToast"))
            return
        }
        if (errors.sampleId) {
            toast.error(t("sampleRequiredToast"))
            return
        }
        toast.error(t("formHasErrors"))
    }

    return (
        <Form {...form}>
            <form id={formId} onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-8">
                        <TabsTrigger value="passport">{t('passport')}</TabsTrigger>
                        <TabsTrigger value="phenotype">{t('phenotypes')}</TabsTrigger>
                        <TabsTrigger value="genetics">{t('genetics')}</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="passport">
                        <StrainPassportTab />
                    </TabsContent>
                    
                    <TabsContent value="phenotype">
                        <StrainPhenotypeTab />
                    </TabsContent>
                    
                    <TabsContent value="genetics">
                        <StrainGeneticsTab />
                    </TabsContent>
                </Tabs>

                {showActions && (
                     <div className="flex items-center gap-4 justify-end mt-8">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={loading}
                        >
                            {tCommon('cancel')}
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEdit ? tCommon('save') : tCommon('create')}
                        </Button>
                    </div>
                )}
            </form>
        </Form>
    )
}
