"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { ApiService, Sample } from "@/services/api"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useRouter } from "@/i18n/routing"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

const sampleSchema = z.object({
    sampleTypeId: z.number().min(1, "Type is required"),
    subject: z.string().optional(),
    siteName: z.string().min(1, "Site name is required"),
    collectedAt: z.date(),
    lat: z.string().optional(),
    lng: z.string().optional(),
    description: z.string().optional(),
})

type SampleFormValues = z.infer<typeof sampleSchema>

interface SampleFormProps {
    initialData?: Sample
    isEdit?: boolean
}

export function SampleForm({ initialData, isEdit = false }: SampleFormProps) {
    const router = useRouter()
    const t = useTranslations('Samples')
    const tCommon = useTranslations('Common')
    const [loading, setLoading] = React.useState(false)
    const [sampleTypes, setSampleTypes] = React.useState<Array<{ id: number; name: string; slug: string }>>([])

    React.useEffect(() => {
        async function fetchSampleTypes() {
            try {
                const types = await ApiService.getSampleTypes()
                setSampleTypes(types)
            } catch (error) {
                console.error('Failed to fetch sample types:', error)
                toast.error(t('failedToLoadSamples'))
            }
        }
        fetchSampleTypes()
    }, [t])

    const form = useForm<SampleFormValues>({
        resolver: zodResolver(sampleSchema),
        defaultValues: {
            sampleTypeId: initialData?.sampleTypeId || undefined,
            subject: initialData?.subject || "",
            siteName: initialData?.siteName || "",
            collectedAt: initialData?.collectedAt ? new Date(initialData.collectedAt) : undefined,
            lat: initialData?.lat?.toString() || "",
            lng: initialData?.lng?.toString() || "",
            description: initialData?.description || "",
        },
    })

    async function onSubmit(data: SampleFormValues) {
        setLoading(true)
        try {
            const payload = {
                ...data,
                collectedAt: data.collectedAt.toISOString(),
                lat: data.lat ? parseFloat(data.lat) : undefined,
                lng: data.lng ? parseFloat(data.lng) : undefined,
            }

            if (isEdit && initialData) {
                await ApiService.updateSample(initialData.id, payload)
                toast.success(t('sampleUpdated'))
                router.back()
                router.refresh()
            } else {
                await ApiService.createSample(payload)
                toast.success(t('sampleCreated'))
                router.push("/samples")
                router.refresh()
            }
        } catch (error) {
            console.error("Failed to save sample:", error)
            toast.error(t('failedToSaveSample'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="sampleTypeId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('sampleType')}</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(parseInt(value))}
                                    value={field.value?.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('selectSampleType')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {sampleTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id.toString()}>
                                                {type.name}
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
                        name="subject"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('subject')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('subjectPlaceholder')} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="siteName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('siteName')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('collectionSitePlaceholder')} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="collectedAt"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>{t('collectionDate')}</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>{t('pickDate')}</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="lat"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('latitude')}</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.000001" placeholder="0.000000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="lng"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('longitude')}</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.000001" placeholder="0.000000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('description')}</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder={t('descriptionPlaceholder')}
                                    className="resize-none min-h-[120px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        {tCommon('cancel')}
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? t('updateSample') : t('createSample')}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
