"use client"

import { useFormContext } from "react-hook-form"
import { useTranslations } from "next-intl"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function StrainGeneticsTab() {
  const t = useTranslations('Strains')
  const { control } = useFormContext()

  return (
     <div className="space-y-6">
        <div className="rounded-xl border bg-card p-4 md:p-5 space-y-4">
             <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold">{t('geneticsAndBiochemistry')}</h3>
                <p className="text-xs text-muted-foreground">{t('geneticsDesc')}</p>
            </div>

             <div className="grid gap-4 sm:grid-cols-2">
                 <FormField
                    control={control}
                    name="genetics.wgsStatus"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('wgsStatus')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('selectStatus')} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="NONE">{t('wgsStatusNone')}</SelectItem>
                                    <SelectItem value="PLANNED">{t('wgsStatusPlanned')}</SelectItem>
                                    <SelectItem value="SEQUENCED">{t('wgsStatusSequenced')}</SelectItem>
                                    <SelectItem value="ASSEMBLED">{t('wgsStatusAssembled')}</SelectItem>
                                    <SelectItem value="PUBLISHED">{t('wgsStatusPublished')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={control}
                    name="genetics.assemblyAccession"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('assemblyAccession')}</FormLabel>
                            <FormControl>
                                <Input placeholder={t('assemblyAccessionPlaceholder')} {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={control}
                name="genetics.marker16sAccession"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('marker16sAccession')}</FormLabel>
                        <FormControl>
                            <Input placeholder={t('marker16sAccessionPlaceholder')} {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="genetics.marker16sSequence"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('marker16sSequence')}</FormLabel>
                        <FormControl>
                            <Textarea 
                                placeholder={t('marker16sSequencePlaceholder')} 
                                className="font-mono text-xs min-h-[150px]" 
                                {...field} 
                                value={field.value ?? ''}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    </div>
  )
}
