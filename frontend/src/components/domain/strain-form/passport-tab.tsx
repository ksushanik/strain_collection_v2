"use client"

import { useFormContext } from "react-hook-form"
import { useTranslations } from "next-intl"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SampleAutocomplete } from "../sample-autocomplete"
import { TaxonomyAutocomplete } from "../taxonomy-autocomplete"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export function StrainPassportTab() {
  const t = useTranslations('Strains')
  const { control, setValue, watch } = useFormContext()
  
  const biosafetyLevel = watch("biosafetyLevel")

  return (
    <div className="space-y-6">
        <div className="rounded-xl border bg-card p-4 md:p-5 space-y-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-base font-semibold">{t('basics')}</h3>
                <p className="text-xs text-muted-foreground">{t('basicsDesc')}</p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                    control={control}
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
                    control={control}
                    name="sampleId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('sourceSample')}</FormLabel>
                            <FormControl>
                                <SampleAutocomplete
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder={t('searchSamplePlaceholder')}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                 <FormField
                    control={control}
                    name="ncbiScientificName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('ncbiScientificName')}</FormLabel>
                            <FormControl>
                                <TaxonomyAutocomplete
                                    value={field.value}
                                    onChange={field.onChange}
                                    onSelect={(item) => {
                                        setValue("ncbiTaxonomyId", parseInt(item.taxId))
                                        setValue("ncbiScientificName", item.name)
                                        // Auto-detect BSL logic could go here if API returned it
                                    }}
                                    placeholder={t('searchTaxonomyPlaceholder')}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={control}
                    name="biosafetyLevel"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('biosafetyLevel')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('selectBSL')} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="BSL_1">{t('bsl1')}</SelectItem>
                                    <SelectItem value="BSL_2">{t('bsl2')}</SelectItem>
                                    <SelectItem value="BSL_3">{t('bsl3')}</SelectItem>
                                    <SelectItem value="BSL_4">{t('bsl4')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {(biosafetyLevel === "BSL_2" || biosafetyLevel === "BSL_3" || biosafetyLevel === "BSL_4") && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{t('warningPathogen')}</AlertTitle>
                    <AlertDescription>
                        {t('warningPathogenDesc')}
                    </AlertDescription>
                </Alert>
            )}

             <div className="grid gap-4 sm:grid-cols-2">
                 <FormField
                    control={control}
                    name="taxonomy16s"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('taxonomy16s')}</FormLabel>
                            <FormControl>
                                <Input placeholder={t('taxonomy16sPlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={control}
                    name="collectionRcam"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('collectionRcam')}</FormLabel>
                            <FormControl>
                                <Input placeholder={t('collectionRcamPlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

             <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                    control={control}
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
                                    <SelectItem value="RHIZOSPHERE">{t('regionRhizosphere')}</SelectItem>
                                    <SelectItem value="ENDOSPHERE">{t('regionEndosphere')}</SelectItem>
                                    <SelectItem value="PHYLLOSPHERE">{t('regionPhyllosphere')}</SelectItem>
                                    <SelectItem value="SOIL">{t('regionSoil')}</SelectItem>
                                    <SelectItem value="OTHER">{t('regionOther')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={control}
                    name="indexerInitials"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('indexer')}</FormLabel>
                            <FormControl>
                                <Input placeholder={t('indexerPlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={control}
                name="otherTaxonomy"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('otherTaxonomy')}</FormLabel>
                        <FormControl>
                            <Input placeholder={t('otherTaxonomyPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="features"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('features')}</FormLabel>
                        <FormControl>
                            <Input placeholder={t('featuresPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="comments"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('comments')}</FormLabel>
                        <FormControl>
                            <Input placeholder={t('commentsPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

             {/* Hidden field for ID */}
            <FormField
                control={control}
                name="ncbiTaxonomyId"
                render={({ field }) => (
                    <input type="hidden" {...field} />
                )}
            />
        </div>
    </div>
  )
}
