"use client"

import { SampleForm } from "@/components/domain/sample-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"

export default function CreateSamplePage() {
    const t = useTranslations('Samples')
    return (
        <div className="p-8 max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">{t('createSample')}</h1>
                <p className="text-muted-foreground">
                    {t('pageDescription')}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <SampleForm />
                </CardContent>
            </Card>
        </div>
    )
}
