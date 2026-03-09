# Architecture Research

**Domain:** Modern Next.js 14 Frontend with App Router
**Researched:** 2026-03-09
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
+-------------------------------------------------------------------+
|                           App Router Layer                         |
+-------------------------------------------------------------------+
|  +-----------+  +-----------+  +-----------+  +-----------------+ |
|  |  layout   |  |   page    |  |  loading  |  |     error       | |
|  |  .tsx     |  |   .tsx    |  |   .tsx    |  |     .tsx        | |
|  +-----+-----+  +-----+-----+  +-----+-----+  +--------+--------+ |
|        |              |              |                   |        |
+--------+--------------+--------------+-------------------+--------+
|                        Component Layer                             |
+--------------------------------------------------------------------+
|  +------------------+  +------------------+  +------------------+  |
|  |  Server Comps    |  |  Client Comps    |  |  Shared/       |  |
|  |  (Default)       |  |  ('use client')  |  |  UI Components |  |
|  +--------+---------+  +--------+---------+  +--------+--------+  |
|           |                   |                     |             |
+-----------+-------------------+---------------------+-------------+
|                        State & Data Layer                         |
+-------------------------------------------------------------------+
|  +------------------+  +------------------+  +------------------+ |
|  |  Zustand Store   |  |  React Query     |  |  URL State       | |
|  |  (Client State)  |  |  (Server State)  |  |  (SearchParams)  | |
|  +------------------+  +------------------+  +------------------+ |
+-------------------------------------------------------------------+
|                        API Layer                                   |
+-------------------------------------------------------------------+
|  +------------------+  +------------------+  +------------------+ |
|  |  Route Handlers  |  |  Server Actions  |  |  External API    | |
|  |  (app/api/)      |  |  ('use server')  |  |  Client          | |
+  +------------------+  +------------------+  +------------------+ |
+-------------------------------------------------------------------+
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `layout.tsx` | Shared UI wrapper, persists across navigations | Server Component by default |
| `page.tsx` | Route-specific UI, entry point for URL | Server Component by default |
| `loading.tsx` | Loading skeleton, wraps page in Suspense | Server Component |
| `error.tsx` | Error boundary for route segment | Client Component (required) |
| `template.tsx` | Re-rendered layout on each navigation | Server Component |
| Server Components | Data fetching, static content, no interactivity | Default, no directive needed |
| Client Components | Interactivity, hooks, browser APIs, event handlers | `'use client'` directive |

## Recommended Project Structure

```
src/
+-- app/                           # App Router (routing layer)
|   +-- (marketing)/               # Route group - not in URL
|   |   +-- page.tsx               # Home page (/)
|   |   +-- layout.tsx             # Marketing layout
|   |   +-- _components/           # Private folder - colocated components
|   |   +-- _lib/                  # Private folder - route utilities
|   +-- (console)/                 # Route group for console pages
|   |   +-- console/
|   |   |   +-- page.tsx           # Console page (/console)
|   |   |   +-- layout.tsx         # Console layout
|   |   |   +-- loading.tsx        # Loading skeleton
|   |   |   +-- error.tsx          # Error boundary
|   |   +-- layout.tsx             # Shared console layout
|   +-- api/                       # API routes (if needed)
|   +-- layout.tsx                 # Root layout (html, body)
|   +-- globals.css                # Global styles + Tailwind
|   +-- not-found.tsx              # 404 page
+-- components/                    # Shared components (outside app)
|   +-- ui/                        # Base UI primitives (atoms)
|   |   +-- button.tsx
|   |   +-- card.tsx
|   |   +-- input.tsx
|   |   +-- select.tsx
|   |   +-- modal.tsx
|   +-- layout/                    # Layout components
|   |   +-- sidebar.tsx
|   |   +-- header.tsx
|   |   +-- footer.tsx
|   +-- features/                  # Feature-specific components
|   |   +-- agent-console/
|   |   +-- result-display/
+-- lib/                           # Utilities and helpers
|   +-- api/                       # API client functions
|   |   +-- client.ts              # Fetch wrapper
|   |   +-- agent.ts               # Agent API calls
|   +-- utils.ts                   # Utility functions
|   +-- constants.ts               # App constants
+-- hooks/                         # Custom React hooks
|   +-- use-agent.ts
|   +-- use-sse.ts
+-- stores/                        # Zustand stores
|   +-- console-store.ts
|   +-- theme-store.ts
+-- types/                         # TypeScript types
|   +-- api.ts
|   +-- agent.ts
+-- providers/                     # Context providers
|   +-- store-provider.tsx
|   +-- theme-provider.tsx
```

### Structure Rationale

- **`app/`**: Routing layer only - keeps routing logic separate from components
- **`components/ui/`**: Atomic design for base primitives (Button, Card, Input) - reusable across entire app
- **`components/features/`**: Feature-based organization for complex components like AgentConsole
- **Route groups `(group)`**: Organize routes without affecting URL structure, enables different layouts
- **Private folders `_folder`**: Colocate route-specific utilities/components, excluded from routing
- **`stores/` outside `app/`**: Zustand stores need to be imported from both server and client code
- **`providers/`**: Client components wrapping context providers, injected at root layout

## Architectural Patterns

### Pattern 1: Server Components by Default

**What:** All components are Server Components unless marked with `'use client'`
**When to use:** Always start with Server Components, only add `'use client'` when necessary
**Trade-offs:**
- Pros: Less client JS, better performance, secure data fetching
- Cons: Cannot use hooks, event handlers, or browser APIs

**Example:**
```typescript
// app/console/page.tsx - Server Component (default)
// Can fetch data directly, access backend resources
import { ConsoleClient } from '@/components/features/console-client'

// This runs on the server
export default async function ConsolePage() {
  // Server-side data fetching (if needed)
  const initialData = await fetchInitialData()

  return (
    <main className="min-h-screen">
      {/* Pass data to client component */}
      <ConsoleClient initialData={initialData} />
    </main>
  )
}
```

### Pattern 2: Client Component Boundary Placement

**What:** Move `'use client'` as deep as possible in the component tree
**When to use:** When only a portion of a page needs interactivity
**Trade-offs:**
- Pros: Minimizes client bundle, preserves Server Component benefits
- Cons: Requires careful prop drilling or composition

**Example:**
```typescript
// app/console/layout.tsx - Server Component
import { Sidebar } from '@/components/layout/sidebar'      // Server Component
import { SearchBar } from '@/components/layout/searchbar'  // Client Component
import { ThemeToggle } from '@/components/ui/theme-toggle' // Client Component

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />              {/* Server-rendered, no client JS */}
      <main>
        <SearchBar />          {/* Only this becomes interactive */}
        {children}
      </main>
      <ThemeToggle />          {/* Only this becomes interactive */}
    </div>
  )
}
```

### Pattern 3: Composition Pattern (Children as Props)

**What:** Pass Server Components as children to Client Components
**When to use:** When a Client Component wrapper needs Server Component content
**Trade-offs:**
- Pros: Keeps Server Components in server module graph, optimal for static content
- Cons: Requires understanding of React composition

**Example:**
```typescript
// components/ui/modal.tsx - Client Component
'use client'

export function Modal({ children, isOpen, onClose }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0">
      <div className="bg-overlay" onClick={onClose} />
      <div className="modal-content">
        {children}  {/* Server Components can be passed here */}
      </div>
    </div>
  )
}

// app/console/page.tsx - Server Component
import { Modal } from '@/components/ui/modal'
import { StaticContent } from '@/components/static-content'

export default function Page() {
  return (
    <Modal isOpen={true}>
      <StaticContent />  {/* This is still a Server Component */}
    </Modal>
  )
}
```

### Pattern 4: Zustand Store Factory (SSR-Safe)

**What:** Create store per request using factory pattern, not global singleton
**When to use:** All Zustand stores in Next.js App Router
**Trade-offs:**
- Pros: Prevents cross-request state leakage, SSR-safe
- Cons: Slightly more boilerplate than global store

**Example:**
```typescript
// stores/console-store.ts
import { createStore } from 'zustand/vanilla'
import { useStore } from 'zustand'

interface ConsoleState {
  endpoint: string
  mode: 'chat' | 'execute'
  setEndpoint: (endpoint: string) => void
  setMode: (mode: 'chat' | 'execute') => void
}

// Factory function - creates new store per request
export function createConsoleStore(initialState?: Partial<ConsoleState>) {
  return createStore<ConsoleState>((set) => ({
    endpoint: initialState?.endpoint ?? '/api/v1/agent/run',
    mode: initialState?.mode ?? 'chat',
    setEndpoint: (endpoint) => set({ endpoint }),
    setMode: (mode) => set({ mode }),
  }))
}

// providers/store-provider.tsx
'use client'

import { createContext, useContext, useRef, ReactNode } from 'react'
import { useStore } from 'zustand'
import { createConsoleStore, ConsoleState } from '@/stores/console-store'

const StoreContext = createContext<ReturnType<typeof createConsoleStore> | null>(null)

export function StoreProvider({ children, initialState }: {
  children: ReactNode
  initialState?: Partial<ConsoleState>
}) {
  const storeRef = useRef<ReturnType<typeof createConsoleStore>>()
  if (!storeRef.current) {
    storeRef.current = createConsoleStore(initialState)
  }

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  )
}

// Custom hook for using the store
export function useConsoleStore<T>(selector: (state: ConsoleState) => T): T {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useConsoleStore must be used within StoreProvider')
  return useStore(store, selector)
}
```

## Data Flow

### Request Flow

```
[User Navigation]
       |
       v
[Server Component] --fetches data--> [Backend API]
       |
       v
[RSC Payload + HTML] --streamed--> [Client]
       |
       v
[Hydration] --makes interactive--> [Interactive UI]
```

### State Management Strategy

```
+------------------------------------------------------------------+
|                    State Decision Tree                            |
+------------------------------------------------------------------+
|                                                                   |
|  URL state? (filters, pagination)                                |
|       |                                                           |
|       +--YES--> useSearchParams() + useRouter()                  |
|       |                                                           |
|       NO                                                          |
|       |                                                           |
|       v                                                           |
|  Server state? (API data, cached)                                |
|       |                                                           |
|       +--YES--> React Query / SWR / Server Components            |
|       |                                                           |
|       NO                                                          |
|       |                                                           |
|       v                                                           |
|  Global client state? (theme, user prefs)                        |
|       |                                                           |
|       +--YES--> Zustand with StoreProvider                       |
|       |                                                           |
|       NO                                                          |
|       |                                                           |
|       v                                                           |
|  Local component state? (form inputs, toggles)                   |
|       |                                                           |
|       +--YES--> useState / useReducer                            |
|                                                                   |
+------------------------------------------------------------------+
```

### Key Data Flows

1. **SSE Streaming Flow**: Backend sends events via SSE -> Client component uses `useEffect` with `EventSource` -> Updates local state -> Re-renders result display

2. **API Call Flow**: Client component calls API client function -> Fetch wrapper handles auth/errors -> Response updates Zustand store -> Components subscribed to store re-render

3. **Server-Side Data Flow**: Server component fetches data -> Passes as props to Client component -> Client component uses as initial state

## Component Organization Patterns

### Option A: Feature-Based (Recommended for StructureClaw)

```
components/
+-- ui/                    # Generic, reusable primitives
|   +-- button.tsx
|   +-- card.tsx
|   +-- input.tsx
+-- layout/                # Layout-specific components
|   +-- sidebar.tsx
|   +-- header.tsx
+-- features/              # Feature-specific compositions
|   +-- agent-console/
|   |   +-- index.tsx          # Main console component
|   |   +-- endpoint-select.tsx
|   |   +-- mode-toggle.tsx
|   |   +-- input-panel.tsx
|   |   +-- result-display.tsx
|   +-- result-display/
|   |   +-- index.tsx
|   |   +-- json-viewer.tsx
|   |   +-- markdown-renderer.tsx
```

**Rationale:** StructureClaw has distinct features (console, result display) with multiple related components. Feature-based keeps related code together.

### Option B: Atomic Design (Alternative)

```
components/
+-- atoms/                 # Smallest units (Button, Input, Label)
+-- molecules/             # Combinations (SearchBar, FormField)
+-- organisms/             # Complex UI sections (AgentConsole)
+-- templates/             # Page layouts
```

**Rationale:** Better for design systems, but adds complexity for single-application projects.

## Build Order (What to Build First)

Based on dependencies, recommended build sequence:

### Phase 1: Foundation
1. **Design Tokens** (CSS variables for colors, spacing, typography)
2. **Tailwind Config** (extend defaults with custom theme)
3. **Base UI Components** (Button, Card, Input, Select - atoms)

### Phase 2: Layout System
4. **Root Layout** (html/body wrapper, providers)
5. **App Shell** (Sidebar, Header, main content area)
6. **Route Groups** ((marketing), (console))

### Phase 3: Feature Components
7. **Console Feature Components** (endpoint select, mode toggle, input panel)
8. **Result Display Components** (JSON viewer, markdown renderer)
9. **State Management** (Zustand stores, providers)

### Phase 4: Pages
10. **Home Page** (marketing content)
11. **Console Page** (compose feature components)
12. **Error/Loading States** (error.tsx, loading.tsx)

## Anti-Patterns to Avoid

### Anti-Pattern 1: Global Zustand Store

**What people do:** Create a global store outside React component tree
```typescript
// WRONG - shared across requests in SSR
const useStore = create((set) => ({ ... }))
```

**Why it's wrong:** Store is shared across all users in SSR, causing data leakage

**Do this instead:** Use store factory pattern with Provider (see Pattern 4 above)

### Anti-Pattern 2: 'use client' at Layout Level

**What people do:** Add `'use client'` to layout.tsx
```typescript
// WRONG - entire layout becomes client-side
'use client'
export default function Layout({ children }) { ... }
```

**Why it's wrong:** All children become client components, loses Server Component benefits

**Do this instead:** Keep layout as Server Component, only mark interactive child components

### Anti-Pattern 3: Importing Server Components into Client Components

**What people do:** Direct import of Server Component in Client Component
```typescript
// WRONG - cannot import Server Component
'use client'
import ServerComponent from './server-component'
```

**Why it's wrong:** Client components cannot render Server Components directly

**Do this instead:** Pass Server Components as children/props (Composition Pattern)

### Anti-Pattern 4: Fetching in Client Components When Server Components Suffice

**What people do:** Use `useEffect` + fetch in client components for static data
```typescript
// WRONG - should use Server Component
'use client'
useEffect(() => { fetch('/api/data')... }, [])
```

**Why it's wrong:** Delays content, poor SEO, unnecessary client JS

**Do this instead:** Fetch in Server Component, pass data as props

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Backend API | Server Components (prefetch) + Client fetch | Server can prefetch, client handles real-time |
| SSE Streaming | Client Component with EventSource | Requires `'use client'` for hooks |
| Theme System | CSS variables + Zustand | Tailwind dark mode via `dark:` variants |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Server Component -> Client Component | Props (serializable only) | Functions, Dates, Maps cannot be passed |
| Client Component -> Server Action | Form action or `useServerAction` | Server Actions run on server |
| Zustand Store -> Components | Context Provider + hooks | Store per request, not global |

## Sources

- [Next.js Official Docs: Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) - HIGH confidence, official documentation
- [Next.js Official Docs: Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components) - HIGH confidence, official documentation
- [Next.js Official Docs: Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components) - HIGH confidence, official documentation
- [Next.js Official Docs: Composition Patterns](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns) - HIGH confidence, official documentation
- [Next.js Official Docs: Tailwind CSS](https://nextjs.org/docs/app/building-your-application/styling/tailwind-css) - HIGH confidence, official documentation
- [Zustand with Next.js App Router Guide](https://eastondev.com/blog/en/posts/dev/20251219-nextjs-state-management/) - MEDIUM confidence, community source with detailed SSR patterns
- [Vercel: Building a Scalable Folder Structure](https://techtales.vercel.app/read/thedon/building-a-scalable-folder-structure-for-large-nextjs-projects) - MEDIUM confidence, community source

---
*Architecture research for: Modern Next.js 14 Frontend with App Router*
*Researched: 2026-03-09*
