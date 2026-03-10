'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useContext } from 'react'
import { createStore } from 'zustand/vanilla'
import { useStore as useZustandStore } from 'zustand'
import { AppStoreContext } from '@/lib/stores/context'
import type { AppLocale } from '@/lib/stores/slices/preferences'

const LOCALE_STORAGE_KEY = 'structureclaw.locale'

export const messages = {
  en: {
    appName: 'StructureClaw',
    console: 'Console',
    agentConsole: 'Agent Console',
    inputControls: 'Input Controls',
    results: 'Results',
    sendRequest: 'Send Request',
    streamSse: 'Stream (SSE)',
    executeHint: 'Type a message to enable execution',
    message: 'Message',
    messagePlaceholder: 'Describe your request, model assumptions, or design goals...',
    conversationId: 'Conversation ID',
    traceId: 'Trace ID',
    optional: 'optional',
    includeModelJson: 'Include Model JSON',
    modelJson: 'Model JSON',
    modelJsonHint: 'Use valid JSON. Example field: modelFormat = structuremodel-v1',
    analysisType: 'Analysis Type',
    reportFormat: 'Report Format',
    reportOutput: 'Report Output',
    autoAnalyze: 'Auto Analyze',
    autoCodeCheck: 'Auto Code Check',
    includeReport: 'Include Report',
    connectionIdle: 'Idle',
    connectionConnecting: 'Connecting...',
    connectionConnected: 'Connected',
    connectionError: 'Error',
    executionResults: 'Execution Results',
    executionResultsDesc: 'Structured response from Agent/Chat',
    status: 'status',
    noToolCalls: 'No tool calls to display.',
    timeline: 'Execution Timeline',
    debugOutput: 'Debug Output',
    rawJson: 'Raw JSON',
    streamFrames: 'Stream Frames',
    none: 'None',
    noFrames: 'No frames',
    noResultsYet: 'No results yet',
    noResultsHint: 'Run a request to see response, metrics, and timeline here.',
    enterConsole: 'Enter Console',
    heroSubtitle: 'Structural engineering AI workspace with practical execution tooling.',
    feature1Title: 'AI-Powered Analysis',
    feature1Desc: 'Automatic structural analysis with guided code checking.',
    feature2Title: 'GB50017 Compliant',
    feature2Desc: 'Built-in steel structure code verification workflow.',
    feature3Title: 'Auto Report Generation',
    feature3Desc: 'Generate professional reports in Markdown and JSON formats.',
    language: 'Language',
    english: 'EN',
    chinese: '中文',
    errorTitle: 'Error',
    clarificationRequired: 'Clarification Required',
    missingFields: 'Missing Fields',
    mode: 'Mode',
    endpoint: 'Endpoint',
    modeFixedHint: 'Mode is fixed for chat-execute endpoint',
  },
  zh: {
    appName: 'StructureClaw',
    console: '控制台',
    agentConsole: 'Agent 控制台',
    inputControls: '输入区域',
    results: '结果区域',
    sendRequest: '发送请求',
    streamSse: '流式执行 (SSE)',
    executeHint: '请先输入消息再执行',
    message: '消息',
    messagePlaceholder: '请输入你的需求、模型假设或设计目标...',
    conversationId: '会话 ID',
    traceId: '追踪 ID',
    optional: '可选',
    includeModelJson: '包含模型 JSON',
    modelJson: '模型 JSON',
    modelJsonHint: '请输入合法 JSON，例如：modelFormat = structuremodel-v1',
    analysisType: '分析类型',
    reportFormat: '报告格式',
    reportOutput: '报告输出',
    autoAnalyze: '自动分析',
    autoCodeCheck: '自动校核',
    includeReport: '包含报告',
    connectionIdle: '空闲',
    connectionConnecting: '连接中...',
    connectionConnected: '已连接',
    connectionError: '错误',
    executionResults: '执行结果',
    executionResultsDesc: 'Agent/Chat 返回的结构化结果',
    status: '状态',
    noToolCalls: '暂无工具调用记录。',
    timeline: '执行时间线',
    debugOutput: '调试输出',
    rawJson: '原始 JSON',
    streamFrames: '流帧',
    none: '无',
    noFrames: '暂无帧',
    noResultsYet: '暂无结果',
    noResultsHint: '执行一次请求后，这里会显示响应、指标和时间线。',
    enterConsole: '进入控制台',
    heroSubtitle: '结构工程 AI 工作台，聚焦可执行与可追踪。',
    feature1Title: 'AI 驱动分析',
    feature1Desc: '自动完成结构分析并提供校核引导。',
    feature2Title: '符合 GB50017',
    feature2Desc: '内置钢结构规范校核流程。',
    feature3Title: '自动生成报告',
    feature3Desc: '支持 Markdown 与 JSON 专业报告输出。',
    language: '语言',
    english: 'EN',
    chinese: '中文',
    errorTitle: '错误',
    clarificationRequired: '需要补充信息',
    missingFields: '缺失字段',
    mode: '模式',
    endpoint: '端点',
    modeFixedHint: 'chat-execute 端点下模式固定',
  },
} as const

type MessageKey = keyof typeof messages.en

type LocaleOnlyStore = {
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
}

const fallbackLocaleStore = createStore<LocaleOnlyStore>()((set) => ({
  locale: 'en',
  setLocale: (locale) => set({ locale }),
}))

const normalizeLocale = (value: unknown): AppLocale | null => {
  if (value === 'en' || value === 'zh') {
    return value
  }
  return null
}

export function useI18n() {
  const appStoreContext = useContext(AppStoreContext)
  const localeStore = (appStoreContext ?? fallbackLocaleStore) as unknown as typeof fallbackLocaleStore
  const locale = useZustandStore(localeStore, (state) => state.locale)
  const setLocale = useZustandStore(localeStore, (state) => state.setLocale)

  const localeInitializedRef = useRef(false)

  useEffect(() => {
    if (localeInitializedRef.current) {
      return
    }
    localeInitializedRef.current = true
    const stored = normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY))
    if (stored && stored !== locale) {
      setLocale(stored)
    }
  }, [locale, setLocale])

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  }, [locale])

  const t = useMemo(() => {
    return (key: MessageKey): string => messages[locale][key]
  }, [locale])

  return { locale, setLocale, t }
}
