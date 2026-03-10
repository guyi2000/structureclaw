import { TimelineItem, type AgentToolCall } from './timeline-item'
import { useI18n } from '@/lib/i18n'

export type { AgentToolCall }

export interface TimelineProps {
  calls: AgentToolCall[]
}

/**
 * Timeline renders a list of tool calls in execution order
 */
export function Timeline({ calls }: TimelineProps) {
  const { t } = useI18n()
  if (calls.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t('noToolCalls')}</p>
    )
  }

  return (
    <ol className="relative">
      {calls.map((call, index) => (
        <TimelineItem key={`${call.tool}-${index}`} call={call} index={index} />
      ))}
    </ol>
  )
}
