

"use client"

import { Suspense } from "react"
import { StrainForm } from "@/components/domain/strain-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, Image as ImageIcon, Archive, Beaker } from "lucide-react"
import { useRouter } from "@/i18n/routing"
import { useState } from "react"
import { useTranslations } from "next-intl"

function CreateStrainPageContent() {
    const t = useTranslations('Strains')
    const tCommon = useTranslations('Common')
    const searchParams = useSearchParams()
    const router = useRouter()
    const returnTo = searchParams?.get("returnTo") || undefined
    const [formSubmitting, setFormSubmitting] = useState(false)

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">{t('createStrain')}</h1>
                <p className="text-muted-foreground">
                    {t('pageDescription')}
                </p>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <StrainForm
                        returnTo={returnTo}
                        formId="strain-form-create"
                        showActions={false}
                        onSubmittingChange={setFormSubmitting}
                    />
                </CardContent>
            </Card>

            <Card className="mb-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Beaker className="h-4 w-4" />
                        {t('media')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    Связь с питательными средами станет доступна после создания штамма.
                </CardContent>
            </Card>

            <Card className="mb-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Archive className="h-4 w-4" />
                        {t('storageLocations')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    Размещение по ячейкам можно добавить после сохранения штамма.
                </CardContent>
            </Card>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        {t('strainPhotos')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    Загрузка фотографий станет доступна после создания записи.
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
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
                <Button
                    type="submit"
                    form="strain-form-create"
                    disabled={formSubmitting}
                >
                    {formSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('createStrain')}
                </Button>
            </div>
        </div>
    )
}

export default function CreateStrainPage() {
    return (
        <Suspense fallback={<div className="p-8">Loading...</div>}>
            <CreateStrainPageContent />
        </Suspense>
    )
}
