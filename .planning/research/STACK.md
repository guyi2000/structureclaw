# Stack Research

**Domain:** Modern Frontend Design System (Next.js 14 + React 18 + Tailwind CSS)
**Researched:** 2026-03-09
**Confidence:** HIGH
**Style Target:** Linear/Notion minimalist aesthetic

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Next.js** | 14.x | React framework | App Router, Server Components, optimal DX for modern React apps. Project constraint. |
| **React** | 18.x | UI library | Project constraint. Concurrent features, Suspense support. |
| **Tailwind CSS** | 3.4.x / 4.x | Utility-first CSS | Rapid styling, consistent design tokens, excellent shadcn/ui integration. |
| **TypeScript** | 5.x | Type safety | Industry standard, catches errors at compile time, excellent IDE support. |

### Component Primitives

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| **shadcn/ui** | 4.x (CLI) | Component collection | Copy-paste workflow gives full control. Built on Radix + Tailwind. The 2025 standard for customizable UI. |
| **Radix UI Primitives** | 1.1.x | Headless accessible components | Unstyled, ARIA-compliant primitives. shadcn/ui is built on these. Use directly when you need primitives not in shadcn. |
| **Headless UI** | 2.x | Alternative primitives | Made by Tailwind team. Consider if Radix maintenance concerns materialize. |

### Icons

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| **Lucide React** | 0.577.x | Icon library | Clean, consistent design rules. 1000+ icons. Tree-shakable. The de facto choice for minimalist UIs in 2025. |

### Animation

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| **framer-motion** | 12.x | Animation library | Now "Motion for React". Declarative API, perfect for Linear-style micro-interactions. Production-grade. |

### State Management

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| **Zustand** | 5.x | Global state | 1.1KB gzipped. Minimal boilerplate. Simpler than Jotai for most use cases. Perfect for UI state (sidebar, modals, theme). |

### Form Handling

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| **React Hook Form** | 7.x | Form state management | Performant, minimal re-renders. Industry standard for React forms in 2025. |
| **Zod** | 3.x / 4.x | Schema validation | TypeScript-first. Integrates with React Hook Form via `@hookform/resolvers`. End-to-end type safety. |
| **@hookform/resolvers** | 5.x | Zod integration | Bridges Zod schemas to React Hook Form. |

### Theming

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| **next-themes** | 0.4.x | Dark/light mode | Works with Next.js App Router and Server Components. Zero flash on hydration. |

### Notifications

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| **Sonner** | 2.x | Toast notifications | Opinionated, beautiful toasts. Used by shadcn/ui. Simple API. |

### Data Display

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| **@tanstack/react-table** | 8.x | Data tables | Headless, highly customizable. Type-safe. Pairs perfectly with shadcn/ui Data Table pattern. |

### Utilities

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| **clsx** | 2.x | Conditional classes | 239B. Smaller/faster than `classnames`. |
| **tailwind-merge** | 3.x | Merge Tailwind classes | Intelligently resolves class conflicts (e.g., `cn("px-2 px-4")` -> `"px-4"`). |
| **class-variance-authority (CVA)** | 0.7.x | Component variants | Define button variants, sizes cleanly. Used by shadcn/ui. |

### Typography

| Font | Source | Purpose | Why Recommended |
|------|--------|---------|-----------------|
| **Geist** | Vercel / npm | Primary font | Vercel's official typeface. Embodies Linear/Notion aesthetic. Sans + Mono variants. |
| **Inter** | Google Fonts | Alternative | If Geist unavailable. Clean, professional, widely used. |

## Installation

```bash
# Core (already in project)
# Next.js 14, React 18, Tailwind CSS, TypeScript

# Initialize shadcn/ui (copies components into your project)
npx shadcn@latest init

# Add common shadcn components
npx shadcn@latest add button card input select dialog popover tooltip toast dropdown-menu

# Supporting libraries
npm install zustand
npm install framer-motion
npm install lucide-react
npm install next-themes
npm install sonner
npm install react-hook-form @hookform/resolvers zod
npm install @tanstack/react-table
npm install clsx tailwind-merge class-variance-authority

# Geist font (optional - can use local or Google Fonts)
npm install geist
```

## Utility Function: `cn()`

Every Tailwind + shadcn project needs this. Create `lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| shadcn/ui | MUI / Ant Design | When you need pre-styled components out of the box and don't need customization |
| shadcn/ui | Mantine | When you want a full-featured library with hooks + components |
| Zustand | Jotai | When you need fine-grained atomic state with derived values |
| Zustand | Redux Toolkit | When you need time-travel debugging, middleware ecosystem |
| Lucide | Heroicons | When you prefer Heroicons' style (also excellent, used by Tailwind UI) |
| Lucide | Phosphor Icons | When you need more icon variants (duotone, fill, etc.) |
| framer-motion | React Spring | When you prefer spring-physics based animations |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `styled-components` | Adds runtime overhead, conflicts with Tailwind utility approach | Tailwind CSS + shadcn/ui |
| `classnames` package | Larger than clsx, same functionality | clsx |
| `react-table` v7 | Deprecated, no longer maintained | @tanstack/react-table v8 |
| `shadcn-ui` npm package | Deprecated old package name | `shadcn` (v4 CLI) |
| Material UI for minimalist aesthetic | Opinionated Google design language doesn't match Linear/Notion style | shadcn/ui |
| Chakra UI | Adds significant bundle size, opinionated theming system | shadcn/ui (gives you control) |
| CSS-in-JS libraries (emotion, stitches) | Redundant with Tailwind, adds complexity | Tailwind CSS |
| Bootstrap | Dated aesthetic, conflicts with Tailwind utility classes | shadcn/ui |

## Stack Patterns by Variant

**If you need maximum performance:**
- Use `next-themes` with `forced-theme` on initial load to prevent hydration mismatch
- Use `framer-motion` `layoutId` for smooth shared element transitions
- Lazy load heavy components with `next/dynamic`

**If you need maximum customization:**
- Start with Radix UI primitives directly, not shadcn/ui
- Build your own component variants with CVA
- Define custom Tailwind color palette matching Linear/Notion

**If you need rapid prototyping:**
- Use shadcn/ui default components as-is
- Use shadcn themes from ui.shadcn.com/themes
- Defer custom styling until later phases

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 14 | React 18.x | React 19 support available in Next.js 15+ |
| shadcn/ui 4.x | Tailwind 3.4.x / 4.x | v4 CLI supports both Tailwind versions |
| framer-motion 12.x | React 18+ | Works with React 19 |
| React Hook Form 7.x | React 18+ | Zod resolver requires @hookform/resolvers |

## shadcn/ui Component Recommendations

For a Linear/Notion-style design system, install these components:

```bash
# Essential
npx shadcn@latest add button card input select dialog

# Navigation & Layout
npx shadcn@latest add sidebar navigation-menu separator scroll-area

# Feedback
npx shadcn@latest add toast (or use sonner directly)
npx shadcn@latest add alert progress skeleton

# Overlays
npx shadcn@latest add popover tooltip dropdown-menu sheet

# Data Display
npx shadcn@latest add table (or build with @tanstack/react-table)
npx shadcn@latest add badge avatar tabs
```

## Design Token Recommendations (Linear/Notion Style)

```css
/* tailwind.config.ts */
{
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
    },
  },
}
```

## Sources

- [shadcn/ui Official Docs](https://ui.shadcn.com/docs) - Component installation, theming (HIGH confidence)
- [shadcn/ui Changelog](https://ui.shadcn.com/docs/changelog) - v4 CLI release notes (HIGH confidence)
- [Radix UI Primitives](https://www.radix-ui.com/primitives) - Accessible component primitives (HIGH confidence)
- [Motion for React](https://motion.dev/docs/react) - Animation library documentation (HIGH confidence)
- [Zustand NPM](https://www.npmjs.com/package/zustand) - State management (HIGH confidence)
- [React Hook Form NPM](https://www.npmjs.com/package/react-hook-form) - Form handling (HIGH confidence)
- [Lucide React NPM](https://www.npmjs.com/package/lucide-react) - Icon library (HIGH confidence)
- [Geist Font - Vercel](https://vercel.com/font) - Typography (HIGH confidence)
- [next-themes NPM](https://www.npmjs.com/package/next-themes) - Theme management (HIGH confidence)
- [Sonner NPM](https://www.npmjs.com/package/sonner) - Toast notifications (HIGH confidence)
- [TanStack Table](https://www.npmjs.com/package/@tanstack/react-table) - Data tables (HIGH confidence)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode) - Official docs (HIGH confidence)
- [Comparing shadcn/ui, Radix, Mantine, MUI - MakersDen](https://makersden.io/blog/react-ui-libs-2025-comparing-shadcn-radix-mantine-mui-chakra) - 2025 comparison (MEDIUM confidence)
- [Reddit: What's the Go-To React UI Library in 2025?](https://www.reddit.com/r/reactjs/comments/1k1gerj/in_2025_whats_the_goto_reactjs_ui_library/) - Community consensus (MEDIUM confidence)
- [Zustand vs Jotai vs Valtio Performance Guide 2025](https://www.reactlibraries.com/blog/zustand-vs-jotai-vs-valtio-performance-guide-2025) - Comparison (MEDIUM confidence)

---
*Stack research for: StructureClaw Frontend Design System*
*Researched: 2026-03-09*
