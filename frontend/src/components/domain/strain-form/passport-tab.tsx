"use client"

import * as React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslations } from "next-intl"
import { ApiService } from "@/services/api"
import type { IndexerEntry } from "@/services/api"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SampleAutocomplete } from "../sample-autocomplete"
import { TaxonomyAutocomplete } from "../taxonomy-autocomplete"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { RichTextEditor } from "@/components/ui/rich-text-editor"

export function StrainPassportTab() {
  const t = useTranslations('Strains')
  const { control, setValue, watch, register } = useFormContext()
  const [indexers, setIndexers] = React.useState<IndexerEntry[]>([])

  const biosafetyLevel = watch("biosafetyLevel")

  React.useEffect(() => {
    register("ncbiTaxonomyId")
  }, [register])

  React.useEffect(() => {
    ApiService.getIndexers()
      .then((res) => setIndexers(res))
      .catch((err) => {
        console.error("Failed to load indexers", err)
      })
  }, [])

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
                                    onChange={(val) => {
                                        field.onChange(val)
                                        if (!val) {
                                            setValue("ncbiTaxonomyId", null)
                                        }
                                    }}
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
                            <Select
                                value={field.value ?? "__none__"}
                                onValueChange={(val) => field.onChange(val === "__none__" ? null : val)}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('selectBSL')} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="__none__">{t('selectBSL')}</SelectItem>
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
                            <Select
                                value={field.value ?? "__none__"}
                                onValueChange={(val) => field.onChange(val === "__none__" ? null : val)}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('selectRegion')} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="__none__">{t('selectRegion')}</SelectItem>
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
                            <Select
                                value={field.value ? field.value : "__none__"}
                                onValueChange={(val) => field.onChange(val === "__none__" ? "" : val)}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('selectIndexer')} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="__none__">{t('noIndexer')}</SelectItem>
                                    {indexers.map((indexer) => (
                                        <SelectItem key={indexer.id} value={indexer.index}>
                                            {indexer.index} - {indexer.fullName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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

            <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                    control={control}
                    name="features"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('features')}</FormLabel>
                            <FormControl>
                                <RichTextEditor
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder={t('featuresPlaceholder')}
                                />
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
                                <RichTextEditor
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder={t('commentsPlaceholder')}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

        </div>
    </div>
  )
}
