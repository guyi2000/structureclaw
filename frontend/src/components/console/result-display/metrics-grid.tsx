import { cn } from '@/lib/utils'

export interface AgentMetrics {
  toolCount?: number
  failedToolCount?: number
  totalToolDurationMs?: number
  maxToolDurationMs?: number
}

export interface MetricsGridProps {
  metrics: AgentMetrics | undefined
}

const METRIC_CONFIG = [
  { key: 'toolCount' as const, label: 'Tool Calls' },
  { key: 'failedToolCount' as const, label: 'Failed' },
  { key: 'totalToolDurationMs' as const, label: 'Total Duration (ms)' },
  { key: 'maxToolDurationMs' as const, label: 'Max Duration (ms)' },
]

/**
 * MetricsGrid displays execution metrics in a responsive grid layout
 */
export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {METRIC_CONFIG.map(({ key, label }) => (
        <div key={key} className="flex flex-col">
          <span className="text-xs text-muted-foreground">{label}</span>
          <strong className="text-lg">
            {metrics?.[key] ?? '-'}
          </strong>
        </div>
      ))}
    </div>
  )
}
