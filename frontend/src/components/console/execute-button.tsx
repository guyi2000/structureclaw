'use client'

import { useStore } from '@/lib/stores/context'
import { Button } from '@/components/ui/button'
import { useConsoleExecution } from '@/hooks/use-console-execution'
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
  const { executeSync, executeStream } = useConsoleExecution()

  return (
    <div className="flex gap-2">
      {/* Send Request Button - Primary */}
      <Button
        variant="default"
        onClick={executeSync}
        disabled={loading}
        aria-label="Send Request"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Send Request
      </Button>

      {/* Stream (SSE) Button - Secondary/Outline */}
      <Button
        variant="outline"
        onClick={executeStream}
        disabled={loading}
        aria-label="Stream (SSE)"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Stream (SSE)
      </Button>
    </div>
  )
}
