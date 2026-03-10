'use client'

import { useEffect, useRef } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import type { AgentError } from '@/lib/api/contracts/agent'
import { useI18n } from '@/lib/i18n'

interface ErrorDisplayProps {
  /** Error object from API or validation */
  error: AgentError | null
  /** Optional additional class names */
  className?: string
}

/**
 * ErrorDisplay - Error state visualization component
 *
 * CONS-15: User receives clear error messages when execution fails
 * ACCS-02: Focus moves to error container when error appears
 *
 * Displays error messages with destructive styling when present.
 * Returns null when no error is provided.
 *
 * Accessibility features:
 * - role="alert" for screen reader announcement
 * - aria-live="assertive" for immediate announcement
 * - tabIndex={-1} allows programmatic focus
 * - Focus is automatically moved to error when it appears
 */
export function ErrorDisplay({ error, className }: ErrorDisplayProps) {
  const alertRef = useRef<HTMLDivElement>(null)
  const { t } = useI18n()

  // Focus the alert when error appears (accessibility)
  useEffect(() => {
    if (error && alertRef.current) {
      alertRef.current.focus()
    }
  }, [error])

  if (!error) {
    return null
  }

  return (
    <Card
      ref={alertRef}
      role="alert"
      aria-live="assertive"
      tabIndex={-1}
      className={cn('bg-destructive/10 border-destructive/20', className)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertCircle
            className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-destructive">{t('errorTitle')}</p>
            <p className="text-sm mt-1 text-destructive/90">{error.message}</p>
            {error.code && (
              <p className="text-xs mt-1 text-destructive/70">Code: {error.code}</p>
            )}
            {error.details && (
              <pre className="text-xs mt-2 overflow-auto text-destructive/80 bg-destructive/5 p-2 rounded">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
