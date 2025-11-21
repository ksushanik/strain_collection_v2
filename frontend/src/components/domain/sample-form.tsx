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
    FormDescription,
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
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const sampleSchema = z.object({
    code: z.string().min(1, "Code is required"),
    sampleType: z.string().min(1, "Type is required"),
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
    const [loading, setLoading] = React.useState(false)

    const form = useForm<SampleFormValues>({
        resolver: zodResolver(sampleSchema),
        defaultValues: {
            code: initialData?.code || "",
            sampleType: initialData?.sampleType || "",
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
            } else {
                await ApiService.createSample(payload)
            }
            router.push("/samples")
            router.refresh()
        } catch (error) {
            console.error("Failed to save sample:", error)
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
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sample Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. SMP-2024-001" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="sampleType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sample Type</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Soil, Water, Plant" {...field} />
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
                                <FormLabel>Collection Site</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Lake Baikal, Station 1" {...field} />
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
                                <FormLabel>Collection Date</FormLabel>
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
                                                    <span>Pick a date</span>
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
                                <FormLabel>Latitude</FormLabel>
                                <FormControl>
                                    <Input type="number" step="any" placeholder="51.2345" {...field} />
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
                                <FormLabel>Longitude</FormLabel>
                                <FormControl>
                                    <Input type="number" step="any" placeholder="104.5678" {...field} />
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
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Detailed description of the sample and collection conditions..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? "Update Sample" : "Create Sample"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
