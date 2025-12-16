"use client"

import { useFormContext } from "react-hook-form"
import { useTranslations } from "next-intl"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export function StrainInventoryTab() {
  const t = useTranslations('Strains')
  const { control } = useFormContext()

  return (
     <div className="space-y-6">
        <div className="rounded-xl border bg-card p-4 md:p-5 space-y-4">
             <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold">{t('inventoryManagement')}</h3>
                <p className="text-xs text-muted-foreground">{t('inventoryDesc')}</p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
                 <FormField
                    control={control}
                    name="stockType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('stockType')}</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('selectType')} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="MASTER">{t('stockTypeMaster')}</SelectItem>
                                    <SelectItem value="WORKING">{t('stockTypeWorking')}</SelectItem>
                                    <SelectItem value="DISTRIBUTION">{t('stockTypeDistribution')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={control}
                    name="passageNumber"
                    render={({ field }) => (
                         <FormItem>
                            <FormLabel>{t('passageNumber')}</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder={t('passageNumberPlaceholder')}
                                    {...field}
                                    value={field.value ?? ''}
                                    onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
             <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                {t('storageLocationHint')}
            </div>
        </div>
    </div>
  )
}
