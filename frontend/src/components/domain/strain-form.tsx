"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ApiService, Strain, CreateStrainInput } from "@/services/api"
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
import { StrainInventoryTab } from "./strain-form/inventory-tab"
import { SubmitHandler } from "react-hook-form"

const strainSchema = z.object({
    identifier: z.string().min(1, "Identifier is required"),
    sampleId: z.string().min(1, "Sample is required"),
    
    // Refactoring v2 Fields
    ncbiScientificName: z.string().optional(),
    ncbiTaxonomyId: z.number().optional(),
    biosafetyLevel: z.enum(["BSL_1", "BSL_2", "BSL_3", "BSL_4"]).optional(),
    
    // Inventory
    stockType: z.enum(["MASTER", "WORKING", "DISTRIBUTION"]).optional(),
    passageNumber: z.number().optional(),

    // Dynamic Traits
    phenotypes: z.array(z.object({
        traitDefinitionId: z.number().optional().nullable(),
        traitName: z.string().min(1, "Required"),
        result: z.string().min(1, "Required"),
        method: z.string().optional(),
        dataType: z.any().optional(),
        options: z.any().optional(),
        units: z.any().optional(),
    })).optional(),

    // Genetics
    genetics: z.object({
        wgsStatus: z.enum(["NONE", "PLANNED", "SEQUENCED", "ASSEMBLED", "PUBLISHED"]).optional(),
        assemblyAccession: z.string().optional(),
        marker16sSequence: z.string().optional(),
        marker16sAccession: z.string().optional(),
    }).optional(),
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

    const [loading, setLoading] = React.useState(false)

    const form = useForm<StrainFormValues>({
        resolver: zodResolver(strainSchema),
        defaultValues: {
            identifier: initialData?.identifier || "",
            sampleId: initialData?.sampleId?.toString() || undefined,
            
            // New fields defaults
            ncbiScientificName: initialData?.ncbiScientificName || "",
            ncbiTaxonomyId: initialData?.ncbiTaxonomyId || undefined,
            biosafetyLevel: (initialData?.biosafetyLevel as any) || undefined,
            stockType: (initialData?.stockType as any) || undefined,
            passageNumber: initialData?.passageNumber || undefined,
            
            phenotypes: initialData?.phenotypes || [],
            genetics: initialData?.genetics || { wgsStatus: "NONE" },
        },
    })

    const onSubmit: SubmitHandler<StrainFormValues> = async (data) => {
        setLoading(true)
        onSubmittingChange?.(true)
        try {
            const payload: CreateStrainInput = {
                ...data,
                sampleId: data.sampleId ? parseInt(data.sampleId) : undefined,
                // Clean up optional fields
                genetics: data.genetics?.wgsStatus === "NONE" && !data.genetics.marker16sSequence ? undefined : data.genetics,
                phenotypes: data.phenotypes?.map(({ traitDefinitionId, traitName, result, method }) => ({
                    traitDefinitionId,
                    traitName,
                    result,
                    method,
                })),
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
                <Tabs defaultValue="passport" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-8">
                        <TabsTrigger value="passport">{t('passport')}</TabsTrigger>
                        <TabsTrigger value="phenotype">{t('phenotypes')}</TabsTrigger>
                        <TabsTrigger value="genetics">{t('genetics')}</TabsTrigger>
                        <TabsTrigger value="inventory">{t('inventory')}</TabsTrigger>
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
                    
                    <TabsContent value="inventory">
                        <StrainInventoryTab />
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
