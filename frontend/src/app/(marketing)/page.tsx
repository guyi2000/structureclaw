'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'
import Link from 'next/link'
import { ArrowRight, Zap, Shield, FileText } from 'lucide-react'

export default function HomePage() {
  const { t } = useI18n()
  const features = [
    {
      icon: Zap,
      title: t('feature1Title'),
      description: t('feature1Desc'),
    },
    {
      icon: Shield,
      title: t('feature2Title'),
      description: t('feature2Desc'),
    },
    {
      icon: FileText,
      title: t('feature3Title'),
      description: t('feature3Desc'),
    },
  ]

  return (
    <main className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <section
        className="flex flex-col items-center justify-center flex-1 gap-8 p-8"
        aria-labelledby="hero-heading"
      >
        <h1 id="hero-heading" className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t('appName')}
        </h1>
        <p className="text-muted-foreground text-center max-w-md text-lg">
          {t('heroSubtitle')}
        </p>
        <Link href="/console">
          <Button size="lg" aria-label={t('enterConsole')}>
            {t('enterConsole')}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </section>

      {/* Features Section */}
      <section className="px-8 pb-12" aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">
          Features
        </h2>
        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <feature.icon className="h-5 w-5" aria-hidden="true" />
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
