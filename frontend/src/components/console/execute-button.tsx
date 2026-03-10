'use client'

import { useStore } from '@/lib/stores/context'
import { Button } from '@/components/ui/button'
import { useConsoleExecution } from '@/hooks/use-console-execution'
import { useI18n } from '@/lib/i18n'
import { Loader2 } from 'lucide-react'

/**
 * ExecuteButton - Execute buttons for sync and streaming requests
 *
 * CONS-07: Execute button triggers sync + SSE streaming
 *
 * Provides two buttons:
 * - "Send Request" for synchronous execution
 * - "Stream (SSE)" for SSE streaming execution
 */
export function ExecuteButton() {
  const loading = useStore((state) => state.loading)
  const message = useStore((state) => state.message)
  const { executeSync, executeStream } = useConsoleExecution()
  const { t } = useI18n()
  const isMessageValid = message.trim().length > 0
  const disabled = loading || !isMessageValid

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
      {/* Send Request Button - Primary */}
        <Button
          variant="default"
          onClick={executeSync}
          disabled={disabled}
          aria-label={t('sendRequest')}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {t('sendRequest')}
        </Button>

      {/* Stream (SSE) Button - Secondary/Outline */}
        <Button
          variant="outline"
          onClick={executeStream}
          disabled={disabled}
          aria-label={t('streamSse')}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {t('streamSse')}
        </Button>
      </div>
      {!isMessageValid && (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {t('executeHint')}
        </p>
      )}
    </div>
  )
}
