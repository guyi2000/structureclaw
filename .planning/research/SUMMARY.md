# Project Research Summary

**Project:** StructureClaw Frontend
**Domain:** Modern Engineering Web Application (Frontend Rewrite)
**Researched:** 2026-03-09
**Confidence:** HIGH

## Executive Summary

StructureClaw is a frontend rewrite project transforming a debug-style interface into a polished, Linear/Notion-inspired engineering workbench for structural engineers in the AEC industry. The backend is stable and feature-complete; this rewrite focuses entirely on the presentation layer using Next.js 14, React 18, and Tailwind CSS.

The recommended approach is to build a design system foundation first (CSS variables, shadcn/ui components, theme support), then incrementally reconstruct pages using feature-based component organization. SSE streaming is the critical integration point requiring careful connection lifecycle management. Key risks include the "second system effect" (over-engineering), breaking existing API compatibility, and retrofitting dark mode after components are built. All three are preventable with upfront discipline: strict scope boundaries, API contract tests before UI work, and design tokens from day one.

## Key Findings

### Recommended Stack

The research confirms the existing technology choices are optimal. The key addition is **shadcn/ui** for component primitives -- its copy-paste workflow gives full control while providing production-ready accessible components built on Radix UI.

**Core technologies:**
- **shadcn/ui (v4 CLI):** Component collection -- copy-paste workflow, full customization, built on Radix + Tailwind
- **Zustand (v5):** Global state -- 1.1KB gzipped, minimal boilerplate, SSR-safe with store factory pattern
- **framer-motion (v12):** Animation -- declarative API, perfect for Linear-style micro-interactions
- **Lucide React:** Icons -- clean minimalist design, 1000+ icons, tree-shakable
- **next-themes (v0.4):** Theme management -- works with App Router, zero flash on hydration
- **Sonner (v2):** Toast notifications -- opinionated, beautiful, used by shadcn/ui
- **React Hook Form + Zod:** Form handling -- industry standard, end-to-end type safety
- **Geist font:** Typography -- Vercel's official typeface, embodies Linear/Notion aesthetic

**Critical utility:** The `cn()` function (clsx + tailwind-merge) is essential for every Tailwind + shadcn project.

### Expected Features

Research identifies clear feature priorities for engineering web applications.

**Must have (table stakes):**
- Responsive sidebar navigation -- collapsible, "inverted L" pattern (sidebar + top bar)
- Dark/Light theme toggle -- tri-state (light/dark/system preference), CSS variables from day one
- Loading states (skeleton screens) -- preferred over spinners for content areas
- Empty states with guidance -- icon + message + CTA
- Error states with recovery -- distinguish network/validation/system errors, offer retry
- Toast notifications -- auto-dismiss 3-5s, bottom-center or bottom-right
- Keyboard accessibility -- Tab navigation, focus states, Escape to close modals
- Design system tokens -- spacing scale (4px base), typography scale, border radius

**Should have (competitive):**
- Command palette (Cmd/Ctrl+K) -- power user navigation, fuzzy matching
- Stream status indicators -- animated indicator during SSE streaming
- Micro-interactions -- button hover states, smooth transitions

**Defer (v2+):**
- Custom theme accents -- personalization feature
- Glassmorphism effects -- visual polish
- Split panel layouts -- advanced layout architecture
- Optimistic UI updates -- requires careful state management

### Architecture Approach

Use feature-based component organization with clear separation between App Router routing layer and component layer. Server Components by default, Client Components only where interactivity is needed.

**Major components:**
1. **Design System (components/ui/)** -- Base UI primitives (Button, Card, Input, Select, Modal)
2. **Layout System (components/layout/)** -- Sidebar, Header, Footer, App Shell
3. **Feature Components (components/features/)** -- AgentConsole, ResultDisplay with sub-components
4. **State Layer (stores/, providers/)** -- Zustand stores with SSR-safe factory pattern
5. **API Client (lib/api/)** -- Centralized fetch wrapper, SSE connection management

**Critical patterns:**
- Server Components by default; push `'use client'` as deep as possible
- Zustand store factory pattern (not global singleton) for SSR safety
- Composition pattern: pass Server Components as children to Client Components

### Critical Pitfalls

1. **Second System Effect (Over-Engineering)** -- Prevent with explicit scope document and "not doing" list; treat as new application with old as reference, not blueprint
2. **Breaking API Compatibility** -- Prevent with API contract tests before UI work; keep API calls in dedicated service layer; use existing TypeScript types verbatim
3. **SSE Connection Lifecycle Mismanagement** -- Always use useEffect cleanup for EventSource; implement reconnection logic with exponential backoff
4. **Dark Mode Retrofit** -- Define all colors as semantic tokens from day one; never hardcode colors in components; support tri-state from start
5. **Accessibility Regression** -- Use semantic HTML first; keyboard navigation from the start; focus management for modals/dropdowns; manual testing with screen readers

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Design System Foundation
**Rationale:** All subsequent work depends on consistent design tokens and base components. Theme support must be built-in from the start to avoid costly refactoring.
**Delivers:** CSS variables for all colors/spacing, Tailwind config, base UI components (Button, Card, Input, Select, Modal), theme provider with tri-state support
**Addresses:** Dark Mode Failures pitfall, Tailwind Migration Issues
**Avoids:** Over-engineering (strict scope: only atoms, no feature components)

### Phase 2: Layout System & Component Library
**Rationale:** Pages need a shell before content can be added. Component library extends foundation with compound components.
**Delivers:** Responsive sidebar, header, app shell; loading/error/empty state components; toast notification setup
**Uses:** shadcn/ui components (sidebar, navigation-menu, toast), Zustand for UI state
**Implements:** Layout System architecture component
**Avoids:** Accessibility Regression (every component WCAG AA verified)

### Phase 3: API Client & Console Rewrite
**Rationale:** Console is the core feature. API client layer must exist first to ensure contract compliance.
**Delivers:** API client service layer with contract tests, SSE hook with proper lifecycle, AgentConsole component with all existing functionality
**Uses:** Zustand store factory pattern, React Hook Form for input, SSE connection management
**Implements:** Feature Components (agent-console)
**Avoids:** Breaking API Compatibility (contract tests), SSE Connection Mismanagement (useEffect cleanup)

### Phase 4: Pages & Polish
**Rationale:** With design system, layout, and components ready, pages are composition work. Polish ensures quality bar.
**Delivers:** Home page (marketing), Console page (compose feature components), error.tsx/loading.tsx for all routes, keyboard navigation verification
**Uses:** Server Components for static content, Client Components for interactive features
**Avoids:** Missing State Feedback (all states verified)

### Phase 5: Final Validation
**Rationale:** Before launch, verify all pitfalls are addressed and performance budgets are met.
**Delivers:** Accessibility audit (axe + manual), performance audit (Lighthouse), API contract verification against real backend, visual QA in both themes
**Verifies:** All critical pitfalls addressed, Core Web Vitals acceptable

### Phase Ordering Rationale

- **Design System first:** Theme tokens must exist before any component CSS is written; prevents dark mode retrofit
- **API Client before Console:** Contract tests verify compatibility before UI work; prevents silent breakages
- **Layout before Pages:** Pages need consistent shell; sidebar navigation is table-stakes feature
- **Validation last:** Holistic view catches issues that span components; performance budgets measured with full app

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3:** SSE streaming patterns -- complex integration, connection pooling considerations for multiple streams
- **Phase 3:** API contract testing -- need to understand existing backend response shapes in detail

Phases with standard patterns (skip research-phase):
- **Phase 1:** Design system tokens -- well-documented, shadcn/ui provides clear patterns
- **Phase 2:** Layout components -- standard responsive patterns, shadcn/ui sidebar is straightforward
- **Phase 4:** Page composition -- standard Next.js App Router patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommendations from official docs (shadcn/ui, Radix, Zustand, framer-motion) |
| Features | MEDIUM | Based on web research and competitor analysis, not direct user research |
| Architecture | HIGH | Next.js 14 App Router patterns well-documented; Zustand SSR patterns verified |
| Pitfalls | HIGH | Sources include contemporary rewrite analysis and established software engineering principles |

**Overall confidence:** HIGH

### Gaps to Address

- **User research on feature priorities:** Feature prioritization based on competitor analysis, not direct user interviews. Validate during Phase 1 with stakeholder review.
- **Existing backend API response shapes:** Need to document all existing API responses before Phase 3. Read existing TypeScript types or API documentation.
- **SSE event types:** Need complete inventory of SSE event types and their payloads. Extract from existing console implementation.

## Sources

### Primary (HIGH confidence)
- [shadcn/ui Official Docs](https://ui.shadcn.com/docs) -- Component installation, theming
- [shadcn/ui Changelog](https://ui.shadcn.com/docs/changelog) -- v4 CLI release notes
- [Radix UI Primitives](https://www.radix-ui.com/primitives) -- Accessible component primitives
- [Next.js Official Docs: Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) -- App Router patterns
- [Next.js Official Docs: Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components) -- SSR patterns
- [Motion for React](https://motion.dev/docs/react) -- Animation library
- [Beware the Rewrite Project: 2026 Edition](https://www.benday.com/blog/beware-the-rewrite-project-2026) -- Rewrite pitfalls
- [The Engineering Cost of Poor Frontend Decisions](https://www.altersquare.io/engineering-cost-poor-frontend-decisions/) -- Technical debt patterns

### Secondary (MEDIUM confidence)
- [Linear Design: The SaaS Design Trend (LogRocket, 2025)](https://blog.logrocket.com/ux-design/linear-design/) -- Linear design principles
- [How We Redesigned the Linear UI (Linear Blog)](https://linear.app/now/how-we-redesigned-the-linear-ui) -- Theme system, accessibility
- [Zustand with Next.js App Router Guide](https://eastondev.com/blog/en/posts/dev/20251219-nextjs-state-management/) -- SSR patterns
- [Comparing shadcn/ui, Radix, Mantine, MUI (MakersDen)](https://makersden.io/blog/react-ui-libs-2025-comparing-shadcn-radix-mantine-mui-chakra) -- 2025 comparison
- [Dark Mode in Design Systems (Design Systems Collective)](https://www.designsystemscollective.com/dark-mode-in-design-systems-the-technical-decisions-nobody-tells-you-about-9c18e974fdc3) -- Theme implementation

### Tertiary (LOW confidence)
- [Reddit: What's the Go-To React UI Library in 2025?](https://www.reddit.com/r/reactjs/comments/1k1gerj/in_2025_whats_the_goto_reactjs_ui_library/) -- Community consensus

---
*Research completed: 2026-03-09*
*Ready for roadmap: yes*
