"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ApiService, Sample, Strain } from "@/services/api"
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

const strainSchema = z.object({
    identifier: z.string().min(1, "Identifier is required"),
    sampleId: z.string().min(1, "Sample is required"),
    gramStain: z.string().optional(),
    seq: z.boolean(),
    phosphates: z.boolean(),
    siderophores: z.boolean(),
    pigmentSecretion: z.boolean(),
    amylase: z.string().optional(),
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
    const [samples, setSamples] = React.useState<Sample[]>([])
    const [loading, setLoading] = React.useState(false)

    const form = useForm<StrainFormValues>({
        resolver: zodResolver(strainSchema),
        defaultValues: {
            identifier: initialData?.identifier || "",
            sampleId: initialData?.sampleId?.toString() || undefined,
            gramStain: initialData?.gramStain || undefined,
            seq: initialData?.seq || false,
            phosphates: initialData?.phosphates || false,
            siderophores: initialData?.siderophores || false,
            pigmentSecretion: initialData?.pigmentSecretion || false,
            amylase: initialData?.amylase || "",
            features: initialData?.features || "",
            comments: initialData?.comments || "",
        },
    })

    React.useEffect(() => {
        ApiService.getSamples({ limit: 500 })
            .then((res) => setSamples(res.data || []))
            .catch(console.error)
    }, [])

    async function onSubmit(data: StrainFormValues) {
        setLoading(true)
        try {
            const payload = {
                ...data,
                sampleId: data.sampleId ? parseInt(data.sampleId) : undefined,
                gramStain: data.gramStain || undefined,
                amylase: data.amylase || undefined,
                features: data.features || undefined,
                comments: data.comments || undefined,
            }

            if (isEdit && initialData) {
                await ApiService.updateStrain(initialData.id, payload)
            } else {
                await ApiService.createStrain(payload)
            }
            const target = returnTo || "/strains"
            router.push(target)
            router.refresh()
        } catch (error) {
            console.error("Failed to save strain:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a sample" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {samples.map((sample) => (
                                            <SelectItem key={sample.id} value={sample.id.toString()}>
                                                {sample.code} ({sample.siteName})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
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
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Characteristics</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="seq"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Sequenced (SEQ)</FormLabel>
                                        <FormDescription>
                                            Has this strain been sequenced?
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phosphates"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Phosphates</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="siderophores"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Siderophores</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="pigmentSecretion"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Pigment Secretion</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="features"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Features</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Describe any special features..."
                                        className="resize-none"
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
                                        className="resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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
