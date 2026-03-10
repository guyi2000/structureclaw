'use client'

import { useStore } from '@/lib/stores/context'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/lib/i18n'

/**
 * MessageInput - Message and context fields input
 *
 * CONS-03: User can input message text
 * Also includes optional conversationId and traceId inputs
 */
export function MessageInput() {
  const message = useStore((state) => state.message)
  const conversationId = useStore((state) => state.conversationId)
  const traceId = useStore((state) => state.traceId)
  const setMessage = useStore((state) => state.setMessage)
  const setConversationId = useStore((state) => state.setConversationId)
  const setTraceId = useStore((state) => state.setTraceId)
  const { t } = useI18n()

  return (
    <div className="space-y-4">
      {/* Main Message Textarea */}
      <div className="space-y-2">
        <label htmlFor="message-input" className="text-sm font-medium">
          {t('message')}
        </label>
        <Textarea
          id="message-input"
          aria-label={t('message')}
          placeholder={t('messagePlaceholder')}
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {/* Secondary Fields Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Conversation ID Input */}
        <div className="space-y-2">
          <label htmlFor="conversation-id" className="text-sm font-medium">
            {t('conversationId')}
          </label>
          <Input
            id="conversation-id"
            aria-label={t('conversationId')}
            type="text"
            placeholder={t('optional')}
            value={conversationId ?? ''}
            onChange={(e) => {
              const value = e.target.value.trim()
              setConversationId(value.length > 0 ? value : null)
            }}
          />
        </div>

        {/* Trace ID Input */}
        <div className="space-y-2">
          <label htmlFor="trace-id" className="text-sm font-medium">
            {t('traceId')}
          </label>
          <Input
            id="trace-id"
            aria-label={t('traceId')}
            type="text"
            placeholder={t('optional')}
            value={traceId ?? ''}
            onChange={(e) => {
              const value = e.target.value.trim()
              setTraceId(value.length > 0 ? value : null)
            }}
          />
        </div>
      </div>
    </div>
  )
}
