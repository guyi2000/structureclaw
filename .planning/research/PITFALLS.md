# Pitfalls Research

**Domain:** Frontend Rewrite Projects (Next.js + React + Tailwind)
**Researched:** 2026-03-09
**Confidence:** HIGH

---

## Critical Pitfalls

Mistakes that cause rewrites to fail, extend timelines significantly, or require re-architecture.

### Pitfall 1: The "Second System Effect" (Over-Engineering)

**What goes wrong:**
The rewrite becomes bloated with features that weren't in the original scope. Developers, now confident from building v1, try to incorporate every pattern, abstraction, and feature they "learned" was missing. What should be a focused UI modernization becomes an architectural playground.

**Why it happens:**
Fred Brooks coined "second-system effect" in *The Mythical Man-Month*: the second system an engineer designs tends to be over-engineered because all the features that were "deferred" in v1 get crammed into v2. Combined with feature creep from stakeholders who see the rewrite as a chance to "fix everything," the scope explodes.

**How to avoid:**
- Treat this as building a **new application** with the old one as reference, not as a blueprint
- Maintain a strict feature parity contract: document every existing feature, mark each as "must have," "nice to have," or "cut"
- Create a "not doing" list explicitly — features that will NOT be included
- Apply the same rigor you'd bring to a greenfield project: prioritized backlog, incremental delivery, scope discipline

**Warning signs:**
- Stakeholders say "while we're at it, can we also..."
- Engineers propose abstractions "for future flexibility" without concrete use cases
- No prioritized feature list exists; "just look at the old app"
- Timeline estimates are vague or overly optimistic

**Phase to address:** Phase 1 (Design System & Foundation) — Establish scope boundaries and "not doing" list before writing any code.

---

### Pitfall 2: Breaking Existing Backend API Compatibility

**What goes wrong:**
The frontend rewrite inadvertently changes how the frontend calls existing backend APIs. This could be:
- Renaming fields in request payloads
- Assuming different response structures
- Breaking SSE/streaming event handling
- Changing error handling expectations

The backend is explicitly "out of scope" for this rewrite, so any breakage is a critical failure.

**Why it happens:**
Developers assume they understand the existing API contracts based on reading code, but miss edge cases, undocumented behaviors, or implicit assumptions. When building new UI components, they may unconsciously refactor how data is fetched or structured.

**How to avoid:**
- **API Contract Tests**: Write contract tests that verify the new frontend calls the existing APIs correctly before any visual work begins
- **API Client Isolation**: Keep API call logic in dedicated service/client modules; do not scatter `fetch` calls throughout components
- **Existing Response Types**: If TypeScript types exist for API responses, use them verbatim; do not "clean them up"
- **SSE Event Handler Parity**: Document every SSE event type and verify new handlers match old behavior exactly

**Warning signs:**
- Someone says "let's refactor the API response types while we're here"
- API calls are being added directly in UI components instead of service layer
- No contract tests exist to verify API compatibility
- SSE event handling logic is being "simplified" or "improved"

**Phase to address:** Phase 2 (Component Library) — Establish API client layer with contract tests before building UI components that consume data.

---

### Pitfall 3: SSE/Streaming Connection Lifecycle Mismanagement

**What goes wrong:**
Server-Sent Events connections leak memory, create duplicate connections, or fail to reconnect properly. This manifests as:
- Multiple overlapping SSE connections after navigation
- Connections not closing when components unmount
- Missing reconnection logic causing silent failures
- Memory leaks in long-running sessions

**Why it happens:**
React's `useEffect` cleanup semantics are tricky. Developers often forget to close the `EventSource` in the cleanup function, or they create new connections on every render. In Next.js App Router, the component lifecycle is even less predictable.

**How to avoid:**
```typescript
// Correct pattern
useEffect(() => {
  const eventSource = new EventSource('/api/stream');

  eventSource.onmessage = (event) => {
    // handle message
  };

  eventSource.onerror = (error) => {
    // handle error, possibly reconnect
  };

  // CRITICAL: Cleanup function
  return () => {
    eventSource.close();
  };
}, []); // Empty deps array to prevent recreation
```

- Use a custom hook (e.g., `useSSE`) that encapsulates connection lifecycle
- Add connection state tracking to detect and prevent duplicate connections
- Implement exponential backoff for reconnection attempts
- Log connection lifecycle events in development for debugging

**Warning signs:**
- `EventSource` is created without a corresponding `close()` call
- Multiple network requests to SSE endpoints in DevTools
- Component re-renders causing new SSE connections
- No error handling for connection failures

**Phase to address:** Phase 3 (Console Rewrite) — This is where SSE streaming is actively used. Verify connection lifecycle before declaring console complete.

---

### Pitfall 4: Dark Mode Implementation Failures

**What goes wrong:**
Dark mode is added as an afterthought, resulting in:
- Hardcoded color values that can't be switched
- White background images/elements that look jarring in dark mode
- Only bi-state (light/dark) instead of tri-state (light/dark/system preference)
- Inconsistent elevation/shadow models between themes
- Flash of wrong theme on page load (FOUC)

**Why it happens:**
Developers start with light mode and hardcode colors (`bg-white`, `text-gray-900`). When dark mode is "added later," every component must be audited and fixed. CSS custom properties weren't established from the start.

**How to avoid:**
- **Design tokens first**: Define all colors as semantic tokens (`--color-background`, `--color-text-primary`) before writing any component CSS
- **Tri-state from day one**: Support light, dark, and system preference (use `prefers-color-scheme` media query)
- **Never hardcode colors in components**: All colors go through design tokens
- **Test both themes continuously**: Every component should be visually verified in both themes during development

```css
/* Tailwind approach */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

**Warning signs:**
- Component code contains `bg-white`, `text-black`, or other direct color utilities
- Dark mode is "we'll add that in Phase X"
- No design token system exists
- Theme switch causes a visible flash

**Phase to address:** Phase 1 (Design System) — Theme support must be built into the design system from the beginning, not retrofitted.

---

### Pitfall 5: Accessibility Regression (The Invisible Fail)

**What goes wrong:**
The rewrite looks beautiful but is unusable for people with disabilities:
- Custom components (modals, dropdowns) lack keyboard navigation
- `aria-hidden` misused on interactive elements
- Focus management broken (focus trapped or lost)
- Insufficient color contrast ratios
- Missing or meaningless alt text
- Heading structure is chaotic (skipping levels, using headings for style)

**Why it happens:**
Accessibility is invisible to developers who don't use assistive technologies. Automated tests (Lighthouse, axe) catch only ~30-40% of WCAG violations. Visual redesigns focus on aesthetics, not semantic HTML.

**How to avoid:**
- **Semantic HTML first**: Use native elements (`<button>`, `<a>`, `<nav>`) before building custom components
- **Keyboard navigation from the start**: Every interactive element must be reachable and operable via keyboard
- **Focus management**: Custom modals/dropdowns must trap focus when open and return focus when closed
- **Manual accessibility testing**: Use screen readers (VoiceOver, NVDA) during development, not just before launch
- **Color contrast audit**: Verify all text/background combinations meet WCAG AA (4.5:1 for normal text, 3:1 for large text)

**Warning signs:**
- `<div onClick>` instead of `<button>`
- Custom dropdown without `aria-expanded`, `aria-controls`, keyboard arrow support
- Modal doesn't trap focus or doesn't return focus on close
- No `tabindex` management for custom interactive elements
- "We'll test accessibility before launch"

**Phase to address:** Phase 2 (Component Library) — Every component must meet WCAG AA before being considered complete. Accessibility is not a separate phase.

---

## Moderate Pitfalls

### Pitfall 6: Scope Creep Through "Just One More Feature"

**What goes wrong:**
The rewrite keeps growing. Every sprint adds new features that weren't in the original plan. The timeline extends indefinitely.

**Prevention:**
- Maintain a strict scope document with explicit "not doing" list
- Any new feature request goes into a backlog for *after* the rewrite completes
- Use timeboxing: "we have N sprints for this phase, what can we realistically deliver?"

**Phase to address:** All phases — Scope management is ongoing.

---

### Pitfall 7: Performance Regression Through Bundle Bloat

**What goes wrong:**
The new "modern" frontend loads slower than the old one. Large JavaScript bundles, unnecessary dependencies, and missing code splitting make the app feel sluggish.

**Prevention:**
- Set performance budgets (e.g., "initial bundle < 200KB gzipped")
- Use route-based code splitting from the start
- Audit dependencies before adding them
- Measure Core Web Vitals (LCP, FID, CLS) and track trends

**Phase to address:** Phase 1 (Design System) — Establish performance budgets early. Phase 4 (Final Polish) — Verify budgets are met.

---

### Pitfall 8: Tailwind CSS Migration Gotchas

**What goes wrong:**
If upgrading Tailwind versions or migrating from custom CSS:
- Dynamic class names (`text-${color}-500`) don't get detected by Tailwind's scanner
- Preflight resets cause unexpected style changes
- `@apply` usage breaks in new versions
- Dark mode classes don't apply correctly

**Prevention:**
- Use safelist for dynamic classes, or avoid dynamic class construction
- Test thoroughly after any Tailwind version upgrade
- Follow the official upgrade guide step-by-step
- Verify dark mode classes (`dark:`) work in all contexts

**Phase to address:** Phase 1 (Design System) — Establish Tailwind configuration correctly from the start.

---

### Pitfall 9: Missing State Feedback (Loading/Error/Empty)

**What goes wrong:**
The happy path works, but edge cases are ignored:
- Loading states are missing or inconsistent
- Error states don't explain what went wrong or how to recover
- Empty states leave users confused
- SSE streaming has no progress indication

**Prevention:**
- Define standard loading/error/empty components in the design system
- Every data-fetching component must handle all three states
- Test with network throttling to see loading states in action
- Error messages should be actionable ("Try again" button, not just "Error")

**Phase to address:** Phase 2 (Component Library) — Include loading/error/empty states in component definitions.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoding colors in components | Faster initial development | Dark mode becomes painful refactoring | Never |
| Skipping accessibility testing | Ships faster | Legal risk, user exclusion, expensive retrofit | Never |
| No API contract tests | Faster to start coding | Silent breakages, debugging nightmares | Never |
| Inline styles for "quick fixes" | Solves immediate problem | Style inconsistency, maintenance burden | Only for one-off, truly unique cases |
| Skipping keyboard navigation | Visual progress feels faster | Inaccessible, requires full component rewrite | Never |
| Copy-paste component code | Faster than abstraction | Divergence, inconsistent behavior, bug multiplication | Only as explicit prototype, never to production |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| SSE Streaming | Creating EventSource in component body instead of useEffect | Use useEffect with cleanup function |
| SSE Streaming | No reconnection logic on connection drop | Implement exponential backoff reconnection |
| SSE Streaming | Assuming events always arrive in order | Handle out-of-order events, use sequence IDs if needed |
| REST API | Scattering fetch calls throughout components | Centralize in API client service layer |
| REST API | Not handling error states from API | Every API call has loading/success/error handling |
| Theme | Reading theme from localStorage without system preference fallback | Check `prefers-color-scheme` media query |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| No code splitting | Initial load time > 3s | Route-based lazy loading from start | First production deploy |
| Large component bundles | Slow navigation between pages | Dynamic imports for heavy components | 10+ routes |
| No React.memo on expensive renders | UI jank on frequent updates | Profile with React DevTools, memo strategically | Real-time data updates |
| Unoptimized images | Slow LCP, wasted bandwidth | Use Next.js Image component, WebP format | Any images on page |
| SSE without connection pooling | Browser connection limit hit | Consider WebSocket for many streams, or multiplex | 6+ concurrent streams |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Console SSE Streaming:** Often missing reconnection logic — verify by disconnecting network and reconnecting
- [ ] **Dark Mode:** Often missing tri-state (system preference) — verify `prefers-color-scheme` works
- [ ] **Keyboard Navigation:** Often missing for custom dropdowns/modals — verify Tab, Enter, Escape work
- [ ] **Focus Management:** Often missing focus trap in modals — verify Tab doesn't escape modal
- [ ] **Error Recovery:** Often missing actionable error states — verify error messages have recovery actions
- [ ] **Loading States:** Often missing for async operations — verify with network throttling
- [ ] **Empty States:** Often missing for lists/tables — verify with no data
- [ ] **API Contract:** Often assumed working — verify with contract tests against real backend

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Over-engineering | HIGH | Ruthlessly cut features, return to MVP scope, delay "nice to haves" to post-launch |
| Broken API compatibility | HIGH | Revert to API client layer, write contract tests, fix incrementally |
| SSE memory leaks | MEDIUM | Add useEffect cleanup, add connection tracking, test with long sessions |
| Dark mode retrofit | HIGH | Audit all components, extract to design tokens, systematic replacement |
| Accessibility retrofit | HIGH | Audit with axe/voiceover, prioritize by WCAG level, fix component by component |
| Performance regression | MEDIUM | Profile with Lighthouse, implement code splitting, audit dependencies |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Over-engineering (Second System Effect) | Phase 1 | Scope document with explicit "not doing" list exists |
| Breaking API Compatibility | Phase 2 | Contract tests pass against real backend |
| SSE Connection Mismanagement | Phase 3 | No EventSource leaks in DevTools after navigation |
| Dark Mode Failures | Phase 1 | Theme switch works, tri-state supported, no flash |
| Accessibility Regression | Phase 2 | axe-core reports 0 violations, keyboard nav works |
| Scope Creep | All phases | Sprint backlog matches scope document |
| Performance Regression | Phase 1, Phase 4 | Lighthouse score > 90, bundle size < budget |
| Tailwind Migration Issues | Phase 1 | All styles apply correctly, dark: variants work |
| Missing State Feedback | Phase 2, Phase 3 | Loading/error/empty states verified for all data |

---

## Sources

- [Beware the Rewrite Project: 2026 Edition](https://www.benday.com/blog/beware-the-rewrite-project-2026) — Ben Day (HIGH confidence, direct rewrite expertise)
- [The Great Rewrite Debate of 2025 (Part 1)](https://levelup.gitconnected.com/the-great-rewrite-debate-of-2025-part-1-the-siren-call-of-the-rewrite-2b827cc7f302) — GitConnected (HIGH confidence, contemporary analysis)
- [The Engineering Cost of Poor Frontend Decisions](https://www.altersquare.io/engineering-cost-poor-frontend-decisions/) — AlterSquare (HIGH confidence, technical depth)
- [Dark Mode in Design Systems: The Technical Decisions Nobody Tells You About](https://www.designsystemscollective.com/dark-mode-in-design-systems-the-technical-decisions-nobody-tells-you-about-9c18e974fdc3) — Design Systems Collective (MEDIUM confidence, practical advice)
- [Notes on implementing dark mode](https://brandur.org/fragments/dark-mode-notes) — Brandur (MEDIUM confidence, tri-state insight)
- [5 Common Web Accessibility Mistakes](https://medium.com/design-domination/5-common-web-accessibility-mistakes-78306fc93980) — Medium (HIGH confidence, WCAG statistics)
- [The Most Common Mistakes in Accessible Web Design](https://eye-able.com/blog/mistakes-in-accessible-web-design) — Eye-Able (HIGH confidence, accessibility expertise)
- [Second-System Syndrome in Software](https://medium.com) — Medium (HIGH confidence, Fred Brooks concept)
- [Tailwind CSS v4 Migration Guide](https://tailwindcss.com/docs/upgrade-guide) — Official Tailwind Docs (HIGH confidence, authoritative)
- [Debugging Tailwind CSS 4 in 2025: Common Mistakes](https://medium.com/@sureshdotariya/debugging-tailwind-css-4-in-2025-common-mistakes-and-how-to-fix-them-b022e6cb0a63) — Medium (MEDIUM confidence, practical examples)
- [Building Real-Time Apps with SSE in React](https://medium.com/front-end-weekly/building-real-time-apps-with-server-sent-events-sse-in-react-8dcb557b767e) — Medium (MEDIUM confidence, React SSE patterns)

---
*Pitfalls research for: Frontend Rewrite Projects (StructureClaw)*
*Researched: 2026-03-09*
