'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { useI18n } from '@/lib/i18n'
import Link from 'next/link'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-14 items-center justify-between border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-semibold">{t('appName')}</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/console" className="text-sm text-muted-foreground hover:text-foreground">
            {t('console')}
          </Link>
          <LanguageToggle />
          <ThemeToggle />
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}
