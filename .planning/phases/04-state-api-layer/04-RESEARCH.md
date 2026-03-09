# Phase 4: State & API Layer - Research

**Researched:** 2026-03-09
**Domain:** Zustand state management, API client patterns, SSE streaming, theme persistence
**Confidence:** HIGH

## Summary

This phase establishes a type-safe data layer for the StructureClaw frontend application. The key challenge is implementing SSR-compatible Zustand stores using the factory pattern, creating a centralized API client with consistent error handling, building a robust SSE hook with proper lifecycle management, and ensuring theme preferences persist across tabs.

**Primary recommendation:** Use Zustand with React Context for SSR-safe stores, native fetch wrapper for API client with typed responses, custom useSSE hook with proper cleanup, and next-themes (already in use) for theme persistence which handles localStorage and cross-tab sync automatically.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| STAT-01 | Zustand store factory pattern (SSR compatible) | Zustand docs + GitHub discussions on Context pattern |
| STAT-02 | API client layer (fetch wrapper) | TypeScript fetch patterns with typed responses |
| STAT-03 | SSE streaming hook | React SSE hook patterns with lifecycle management |
| STAT-04 | Theme state management | next-themes already handles localStorage + cross-tab sync |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | ^4.5.2 | State management | Already in project; SSR-compatible with Context pattern |
| next-themes | ^0.4.6 | Theme persistence | Already in project; handles localStorage and system preference |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-query | ^5.28.4 | Server state caching | Already in project; for API caching |
| axios | ^1.6.8 | HTTP client | Already in project; can use for API client or stick with fetch |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| zustand + Context | jotai | jotai has better RSC support but team already uses Zustand |
| native fetch | axios | axios has interceptors but fetch is native and sufficient |
| custom SSE hook | event-source-polyfill | Only needed for very old browser support |

**Installation:**
Already installed in project - no new dependencies required.

## Architecture Patterns

### Recommended Project Structure
```
frontend/src/
├── lib/
│   ├── api/                    # API client layer
│   │   ├── client.ts           # Base fetch wrapper
│   │   ├── errors.ts           # Error types and handling
│   │   └── contracts/          # API type definitions
│   ├── stores/                 # Zustand stores
│   │   ├── context.tsx         # Store provider with Context
│   │   ├── slices/             # Store slices
│   │   │   ├── console.ts      # Console state slice
│   │   │   └── preferences.ts  # User preferences slice
│   │   └── index.ts            # Store factory and types
├── hooks/
│   ├── use-sse.ts              # SSE streaming hook
│   └── use-mobile.tsx          # (existing)
```

### Pattern 1: Zustand Store Factory with Context (STAT-01)

**What:** Creates a new store instance per request using React Context, preventing SSR state leakage.

**When to use:** All client-side stores in Next.js App Router to avoid hydration mismatches.

**Example:**
```typescript
// Source: Zustand docs + GitHub discussion #2326
// lib/stores/context.tsx
'use client'

import { createContext, useContext, useRef, type ReactNode } from 'react'
import { type StoreApi, useStore as useZustandStore } from 'zustand'
import { createStore } from 'zustand/vanilla'
import { consoleSlice, type ConsoleSlice } from './slices/console'

export type StoreState = ConsoleSlice

export const initStore = (): StoreState => {
  return {
    ...consoleSlice.getInitialState(),
  }
}

export const createAppStore = (initState: StoreState = initStore()) => {
  return createStore<StoreState>()((set, get, store) => ({
    ...initState,
    ...consoleSlice(set, get, store),
  }))
}

export const AppStoreContext = createContext<StoreApi<StoreState> | null>(null)

export interface AppStoreProviderProps {
  children: ReactNode
}

export const AppStoreProvider = ({ children }: AppStoreProviderProps) => {
  const storeRef = useRef<StoreApi<StoreState>>()
  if (!storeRef.current) {
    storeRef.current = createAppStore(initStore())
  }

  return (
    <AppStoreContext.Provider value={storeRef.current}>
      {children}
    </AppStoreContext.Provider>
  )
}

export const useStore = <T,>(selector: (store: StoreState) => T): T => {
  const appStoreContext = useContext(AppStoreContext)

  if (!appStoreContext) {
    throw new Error('useStore must be used within AppStoreProvider')
  }

  return useZustandStore(appStoreContext, selector)
}
```

**Slice Pattern Example:**
```typescript
// lib/stores/slices/console.ts
import { type StateCreator } from 'zustand'
import { type StoreState } from '../context'

export interface ConsoleState {
  endpoint: 'agent-run' | 'chat-message' | 'chat-execute'
  mode: 'chat' | 'execute' | 'auto'
  conversationId: string | null
  traceId: string | null
}

export interface ConsoleActions {
  setEndpoint: (endpoint: ConsoleState['endpoint']) => void
  setMode: (mode: ConsoleState['mode']) => void
  setConversationId: (id: string | null) => void
  resetConsole: () => void
}

export type ConsoleSlice = ConsoleState & ConsoleActions

export const initialConsoleState: ConsoleState = {
  endpoint: 'chat-message',
  mode: 'auto',
  conversationId: null,
  traceId: null,
}

export const createConsoleSlice: StateCreator<StoreState, [], [], ConsoleSlice> = (set) => ({
  ...initialConsoleState,
  setEndpoint: (endpoint) => set({ endpoint }),
  setMode: (mode) => set({ mode }),
  setConversationId: (conversationId) => set({ conversationId }),
  resetConsole: () => set(initialConsoleState),
})
```

### Pattern 2: API Client with Error Handling (STAT-02)

**What:** Centralized fetch wrapper with typed responses, error handling, and request configuration.

**When to use:** All API calls should go through this client.

**Example:**
```typescript
// Source: TypeScript fetch best practices
// lib/api/errors.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error: ${status} ${statusText}`)
    this.name = 'ApiError'
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network request failed') {
    super(message)
    this.name = 'NetworkError'
  }
}

// lib/api/client.ts
import { ApiError, NetworkError } from './errors'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = await response.json().catch(() => undefined)
    throw new ApiError(response.status, response.statusText, data)
  }
  return response.json() as Promise<T>
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers, ...restOptions } = options

  const config: RequestInit = {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config)
    return handleResponse<T>(response)
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new NetworkError()
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'PUT', body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
}
```

### Pattern 3: SSE Hook with Lifecycle Management (STAT-03)

**What:** Custom hook that manages EventSource connection with proper cleanup, reconnection, and state management.

**When to use:** Real-time streaming from server (chat, agent execution).

**Example:**
```typescript
// Source: React SSE patterns + GitHub Gist (Mosharush)
// hooks/use-sse.ts
import { useCallback, useEffect, useRef, useState } from 'react'

export type SSEConnectionState = 'CONNECTING' | 'OPEN' | 'CLOSED'

interface UseSSEOptions {
  url: string
  enabled?: boolean
  onMessage?: (data: string) => void
  onError?: (error: Event) => void
}

interface UseSSEReturn {
  connectionState: SSEConnectionState
  error: Event | null
  data: string | null
  connect: () => void
  disconnect: () => void
}

export function useSSE({
  url,
  enabled = true,
  onMessage,
  onError,
}: UseSSEOptions): UseSSEReturn {
  const [connectionState, setConnectionState] = useState<SSEConnectionState>('CONNECTING')
  const [error, setError] = useState<Event | null>(null)
  const [data, setData] = useState<string | null>(null)

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptRef = useRef(0)

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    setConnectionState('CLOSED')
    reconnectAttemptRef.current = 0
  }, [])

  const connect = useCallback(() => {
    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    setConnectionState('CONNECTING')
    setError(null)

    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setConnectionState('OPEN')
      setError(null)
      reconnectAttemptRef.current = 0
    }

    eventSource.onmessage = (event) => {
      setData(event.data)
      onMessage?.(event.data)
    }

    eventSource.onerror = (err) => {
      setError(err)
      onError?.(err)

      if (eventSource.readyState === EventSource.CLOSED) {
        setConnectionState('CLOSED')
        // Exponential backoff reconnection (max 30s)
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 30000)
        reconnectAttemptRef.current++

        reconnectTimeoutRef.current = setTimeout(() => {
          if (reconnectAttemptRef.current <= 5) {
            connect()
          }
        }, delay)
      }
    }
  }, [url, onMessage, onError])

  useEffect(() => {
    if (enabled) {
      connect()
    }
    return () => {
      disconnect()
    }
  }, [enabled, connect, disconnect])

  return {
    connectionState,
    error,
    data,
    connect,
    disconnect,
  }
}
```

### Pattern 4: Theme State Management (STAT-04)

**What:** next-themes already handles theme persistence with localStorage and cross-tab sync.

**When to use:** Already implemented in providers.tsx - no additional work needed.

**Existing Implementation:**
```typescript
// Source: Existing src/app/providers.tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
```

**Cross-tab sync:** next-themes automatically syncs theme changes across tabs via the `storage` event listener built into browsers. No additional code needed.

### Anti-Patterns to Avoid

- **Global Zustand store:** Do NOT create stores at module level - causes SSR state leakage
- **Missing cleanup in SSE:** Always close EventSource in useEffect cleanup
- **Unhandled SSE errors:** Always check `readyState` before attempting reconnection
- **Blocking UI on fetch:** Use React Query for loading states, not manual state

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State persistence | Custom localStorage sync | next-themes | Handles SSR hydration, system preference, cross-tab |
| SSE reconnection | Manual setTimeout loop | Exponential backoff pattern | Prevents server overload |
| API caching | Custom cache object | @tanstack/react-query | Already in project, battle-tested |
| Form state | useState for each field | Zustand slice or react-hook-form | Complex validation needs |

**Key insight:** The project already has most infrastructure (Zustand, React Query, next-themes). Focus on proper patterns, not new libraries.

## Common Pitfalls

### Pitfall 1: Zustand Hydration Mismatch
**What goes wrong:** Server and client render different initial state, causing hydration errors.
**Why it happens:** Using `create()` at module level creates shared state across requests.
**How to avoid:** Use `createStore` with React Context provider pattern (see Pattern 1).
**Warning signs:** "Hydration failed" errors in console, flickering UI on page load.

### Pitfall 2: SSE Memory Leaks
**What goes wrong:** EventSource connections not closed when component unmounts.
**Why it happens:** Missing cleanup in useEffect or complex component lifecycles.
**How to avoid:** Always return cleanup function from useEffect, use refs for EventSource.
**Warning signs:** Increasing network connections in DevTools, stale data updates after navigation.

### Pitfall 3: SSE Duplicate Reconnection
**What goes wrong:** Browser auto-reconnect AND manual reconnection both fire.
**Why it happens:** Not checking `readyState` before attempting reconnection.
**How to avoid:** Only reconnect when `readyState === EventSource.CLOSED`.
**Warning signs:** Multiple simultaneous connections, erratic data flow.

### Pitfall 4: API Error Swallowing
**What goes wrong:** Network errors or non-JSON responses crash the app.
**Why it happens:** Assuming response.json() always succeeds.
**How to avoid:** Wrap in try/catch, check response.ok before parsing, handle NetworkError separately.
**Warning signs:** Blank screens on network failure, unhelpful error messages.

## Code Examples

### Complete Store Provider Integration
```typescript
// app/layout.tsx (add to existing providers)
import { AppStoreProvider } from '@/lib/stores/context'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppStoreProvider>
            {children}
          </AppStoreProvider>
        </Providers>
      </body>
    </html>
  )
}
```

### Using Store in Component
```typescript
// components/console/endpoint-selector.tsx
'use client'

import { useStore } from '@/lib/stores/context'

export function EndpointSelector() {
  const { endpoint, setEndpoint } = useStore((state) => ({
    endpoint: state.endpoint,
    setEndpoint: state.setEndpoint,
  }))

  return (
    <select value={endpoint} onChange={(e) => setEndpoint(e.target.value as any)}>
      <option value="chat-message">/chat/message</option>
      <option value="chat-execute">/chat/execute</option>
      <option value="agent-run">/agent/run</option>
    </select>
  )
}
```

### API Client Usage with Types
```typescript
// lib/api/contracts/chat.ts
export interface ChatMessageRequest {
  message: string
  mode?: 'chat' | 'execute' | 'auto'
  conversationId?: string
  context?: {
    model?: Record<string, unknown>
    analysisType?: 'static' | 'dynamic' | 'seismic' | 'nonlinear'
    autoAnalyze?: boolean
    autoCodeCheck?: boolean
    includeReport?: boolean
  }
}

export interface AgentResult {
  traceId?: string
  success?: boolean
  response?: string
  toolCalls?: Array<{
    tool: string
    status: 'success' | 'error'
    durationMs?: number
  }>
}

// Usage
import { api } from '@/lib/api/client'
import type { ChatMessageRequest, AgentResult } from '@/lib/api/contracts/chat'

async function sendMessage(request: ChatMessageRequest) {
  return api.post<AgentResult>('/api/v1/chat/message', request)
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Global Zustand store | Context-based store factory | 2024 (Next.js App Router) | Prevents SSR state leakage |
| Manual SSE cleanup | useEffect cleanup pattern | Standard React | Prevents memory leaks |
| Custom theme sync | next-themes with built-in sync | Already in project | Handles edge cases |

**Deprecated/outdated:**
- Zustand global `create()`: Causes SSR issues, use Context pattern instead
- Custom localStorage sync for theme: next-themes handles this automatically

## Open Questions

1. **Should we use axios or native fetch for the API client?**
   - What we know: axios has interceptors and better error handling
   - What's unclear: Team preference, whether interceptors are needed
   - Recommendation: Start with fetch wrapper (simpler), migrate to axios if interceptors become necessary

2. **Should console state be separate from preferences state?**
   - What we know: Slices can be combined into one store
   - What's unclear: Future requirements for user preferences
   - Recommendation: Start with console slice only, add preferences slice when needed

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.0.18 |
| Config file | `frontend/vitest.config.ts` |
| Quick run command | `cd frontend && npm run test` |
| Full suite command | `cd frontend && npm run test:run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STAT-01 | Store factory creates per-request store | unit | `vitest run tests/stores/context.test.tsx` | No - Wave 0 |
| STAT-01 | Store provider throws without context | unit | `vitest run tests/stores/context.test.tsx` | No - Wave 0 |
| STAT-01 | useStore returns selected state | unit | `vitest run tests/stores/context.test.tsx` | No - Wave 0 |
| STAT-02 | API client handles success response | unit | `vitest run tests/api/client.test.ts` | No - Wave 0 |
| STAT-02 | API client throws ApiError on failure | unit | `vitest run tests/api/client.test.ts` | No - Wave 0 |
| STAT-02 | API client throws NetworkError on fetch fail | unit | `vitest run tests/api/client.test.ts` | No - Wave 0 |
| STAT-03 | SSE hook connects on mount | unit | `vitest run tests/hooks/use-sse.test.ts` | No - Wave 0 |
| STAT-03 | SSE hook disconnects on unmount | unit | `vitest run tests/hooks/use-sse.test.ts` | No - Wave 0 |
| STAT-03 | SSE hook reconnects with backoff | unit | `vitest run tests/hooks/use-sse.test.ts` | No - Wave 0 |
| STAT-04 | Theme persists in localStorage | integration | `vitest run tests/integration/theme-persistence.test.tsx` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `cd frontend && npm run test`
- **Per wave merge:** `cd frontend && npm run test:run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/stores/context.test.tsx` - covers STAT-01 store factory
- [ ] `tests/stores/slices/console.test.ts` - covers console slice
- [ ] `tests/api/client.test.ts` - covers STAT-02 API client
- [ ] `tests/api/errors.test.ts` - covers error classes
- [ ] `tests/hooks/use-sse.test.ts` - covers STAT-03 SSE hook
- [ ] `tests/integration/theme-persistence.test.tsx` - covers STAT-04
- [ ] SSE mock setup: Add EventSource mock to `tests/setup.ts`

**EventSource Mock for tests:**
```typescript
// Add to tests/setup.ts
class MockEventSource {
  url: string
  readyState: number = EventSource.CONNECTING
  onopen: ((this: EventSource, ev: Event) => any) | null = null
  onmessage: ((this: EventSource, ev: MessageEvent) => any) | null = null
  onerror: ((this: EventSource, ev: Event) => any) | null = null

  constructor(url: string) {
    this.url = url
    setTimeout(() => {
      this.readyState = EventSource.OPEN
      this.onopen?.call(this as any, new Event('open'))
    }, 0)
  }

  close() {
    this.readyState = EventSource.CLOSED
  }

  addEventListener() {}
  removeEventListener() {}
}

global.EventSource = MockEventSource as unknown as typeof EventSource
```

## Sources

### Primary (HIGH confidence)
- [Zustand GitHub Discussion #2326](https://github.com/pmndrs/zustand/discussions/2326) - SSR pattern with Context
- [Zustand Next.js Integration Guide](https://docs.pmnd.rs/zustand/guides/nextjs) - Official docs
- [next-themes Documentation](https://github.com/pacocoursey/next-themes) - Theme persistence

### Secondary (MEDIUM confidence)
- [React SSE Hook Implementation](https://gist.github.com/Mosharush/8bbc178bbc7e47c7c7c554dd7b5c5528) - SSE patterns
- [Implementing React SSE - Medium](https://medium.com/@dlrnjstjs/implementing-react-sse-server-sent-events-real-time-notification-system-a999bb983d1b) - Comprehensive guide
- [TypeScript Fetch API Patterns](https://dev.to/limacodes/building-a-type-safe-api-client-in-typescript-beyond-axios-vs-fetch-4a3i) - API client patterns

### Tertiary (LOW confidence)
- [Zustand persist cross-tab sync](https://github.com/pmndrs/zustand/discussions/1141) - Alternative approaches for sync

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Already in project, verified versions
- Architecture: HIGH - Based on official Zustand docs and proven patterns
- Pitfalls: HIGH - Well-documented issues with clear solutions

**Research date:** 2026-03-09
**Valid until:** 30 days (stable patterns, but check for Zustand v5 release)
