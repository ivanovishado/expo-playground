# AGENTS.md — Expo Playground

> Codebase guide and skill router for AI agents. Project hooks enforce code conventions and quality gates automatically.

---

## 1. Project Overview

Annotated Expo Playground is an **educational tool that helps beginner students understand LLM-generated Expo/React Native code**. Students paste code into the playground, and the system automatically detects programming concepts via AST analysis, highlights them in the editor, and provides guided educational walkthroughs.

**Core interaction:** paste code → AST detection → clickable highlights → concept walkthrough + live preview

**Three-column layout:**

- **Left**: Concept walkthrough panel — educational content sourced from Expo docs + navigation
- **Center**: Code editor (CodeMirror 6) — paste code, see clickable concept highlights
- **Right**: Live Snack preview — see the app running in real-time

**No backend, no database, no auth for MVP.**

## 2. Tech Stack

| Layer | Tech | Version |
|-------|------|---------|
| Framework | Next.js (App Router, Turbopack) | 16 |
| Language | TypeScript (strict) | 5 |
| UI | Tailwind CSS (CSS-first config) | v4 |
| Editor | CodeMirror 6 (`@uiw/react-codemirror`) | 4.25 |
| AST Analysis | `@babel/parser` + `@babel/traverse` | 7.29 |
| Live Preview | `snack-sdk` | 6.6 |
| Panels | `react-resizable-panels` (drag-to-resize, collapsible) | 1 |
| Content | `next-mdx-remote` (MDX concept cards) | 6 |
| Deploy | GitHub Pages (static export) | — |
| Linting | ESLint + Prettier | — |

## 3. Architecture

### Directory Map

```
app/
  layout.tsx                      # Root layout
  page.tsx                        # Main playground page (client component)
components/
  PlaygroundShell.tsx             # 3-column layout orchestrator
  CodeEditor.tsx                  # CodeMirror + clickable concept highlights
  ConceptPanel.tsx                # Walkthrough panel + navigation
  ConceptList.tsx                 # Clickable concept chips/dots
  SnackPreview.tsx                # snack-sdk iframe wrapper
  ExamplePicker.tsx               # Pre-loaded example buttons
lib/
  analyzer.ts                     # Babel AST → DetectedConcept[] (single merged traversal)
  categories.ts                   # Centralized category config (colors, labels)
  detectors/                      # Concept detector visitor factories
    imports.ts
    hooks.ts
    components.ts
    jsx-elements.ts
    styles.ts
    events.ts
    index.ts                      # Aggregates all visitor factories
    utils.ts                      # Shared helpers (toConceptLocation)
  concept-loader.ts               # Loads MDX concept cards
  codemirror-decorations.ts       # DetectedConcept[] → CM decorations
  types.ts                        # Shared types
content/
  concepts/                       # MDX concept cards, organized by locale
    en/                           # English (default) — 17 MDX files
      import.mdx
      component-function.mdx
      jsx.mdx
      useState.mdx
      useEffect.mdx
      stylesheet.mdx
      ...
    es/                           # Spanish translations (partial — falls back to English)
      import.mdx
      useState.mdx
      view.mdx
  examples/                       # Pre-loaded example apps
    counter.ts
    todo-list.ts
    profile-card.ts
```

### Key Patterns

- **Client-heavy architecture** — The main playground page is a client component orchestrating CodeMirror, Snack SDK, and the concept panel. Server components are used for layout and static content only.
- **AST-driven highlights** — `@babel/parser` parses student code, detectors export visitor factories that are merged via `traverse.visitors.merge()` into a single AST traversal, and CodeMirror decorations render clickable highlights via a `StateField`/`StateEffect` pattern.
- **MDX concept cards** — Educational content stored as MDX files with frontmatter (id, title, category, color, expoDocUrl). Loaded via `next-mdx-remote`.
- **Color-coded categories** — basics=blue, hooks=purple, styling=green, events=orange. Centralized in `lib/categories.ts`; CodeMirror decorations use a generic `.cm-concept` class with `--concept-color` CSS variable.
- **Debounced analysis** — Code analysis and Snack preview updates are debounced (~1s) on editor changes.

## 4. Build & Dev Commands

```bash
npm run dev              # Start Next.js dev server (Turbopack)
npm run build            # Production build
npm run lint             # ESLint
npm run format           # Prettier write
npm run format:check     # Prettier check
npm run check-types      # TypeScript type checking (tsc --noEmit)
```

## 5. Code Conventions

Items marked _(hook-enforced)_ are blocked at edit time by project hooks — Claude cannot save code that violates these.

- **TypeScript strict** — no `any`, strict mode enabled. _(hook-enforced)_
- **No console.log in app code** — Allowed in test files only. _(hook-enforced)_
- **Auto-formatted** — Prettier runs automatically after every edit. _(hook-enforced)_
- **Type-checked on stop** — `tsc --noEmit` runs automatically before task completion. _(hook-enforced)_
- **Server components by default** — Only add `"use client"` when client interactivity is required.
- **English for everything** — Code, comments, commits, and UI all in English (educational tool for international audience).
- **Tailwind v4 CSS-first** — No `tailwind.config.ts`. Configuration via CSS `@theme` directive in global CSS.

## 6. MCP Servers

### Context7 — Live Documentation Lookup

Use Context7 to fetch **up-to-date documentation and code examples** for any library in the stack.

**Workflow (always two steps):**

1. `resolve-library-id` — Search for the library by name to get its Context7 ID.
2. `query-docs` — Query documentation using the resolved ID and a specific question.

**When to use:** Before implementing with an API you're unsure about — especially for CodeMirror 6 decorations, Babel traverse visitors, snack-sdk integration, and next-mdx-remote rendering. These APIs are specialized and Context7 provides more precise guidance than general skills.

## 7. Skill Discovery — Intent Table

| If your task involves... | Use skill |
|--------------------------|-----------|
| Building a Next.js feature | `next-best-practices` |
| Next.js caching and PPR | `next-cache-components` |
| React performance and patterns | `vercel-react-best-practices` |
| React composition and component design | `vercel-composition-patterns` |
| Tailwind CSS layout and styling | `tailwind-css-patterns` |
| High-quality frontend UI design | `frontend-design` |
| UI design review and compliance | `web-design-guidelines` |
| React Native / Expo concepts (for content) | `vercel-react-native-skills` |
| Using shadcn/ui components | `shadcn` |
| Researching docs, APIs, or web content | `firecrawl:firecrawl-cli` |
| Creating hooks to prevent bad patterns | `hookify:hookify` |
| Analyzing codebase for automation setup | `claude-code-setup:claude-automation-recommender` |

## 8. Skills by Category

### Core (5)

| Skill | Description |
|-------|-------------|
| `next-best-practices` | Next.js App Router patterns |
| `next-cache-components` | PPR, caching, cacheLife/cacheTag |
| `vercel-react-best-practices` | React performance optimization |
| `vercel-composition-patterns` | Component composition patterns |
| `tailwind-css-patterns` | Tailwind CSS v4 layout and utility patterns |

### Design (3)

| Skill | Description |
|-------|-------------|
| `frontend-design` | High-quality UI design |
| `web-design-guidelines` | UI design review and compliance |
| `shadcn` | shadcn/ui component patterns |

### Domain (1)

| Skill | Description |
|-------|-------------|
| `vercel-react-native-skills` | React Native / Expo best practices (for concept card content) |

### Workflow (2)

| Skill | Description |
|-------|-------------|
| `firecrawl:firecrawl-cli` | Web research, documentation lookup, scraping (replaces WebFetch/WebSearch) |

### Tooling (3)

| Skill | Description |
|-------|-------------|
| `skill-creator:skill-creator` | Create, modify, and test agent skills |
| `hookify:hookify` | Create hooks to prevent bad patterns from conversation analysis |
| `claude-code-setup:claude-automation-recommender` | Analyze codebase for Claude Code automation opportunities |

## 9. Workflow Chains

Common skill sequences for end-to-end workflows:

```
New Component:     vercel-composition-patterns → tailwind-css-patterns → frontend-design
Layout Work:       tailwind-css-patterns → frontend-design → web-design-guidelines
Concept Content:   vercel-react-native-skills → (write MDX)
Performance:       vercel-react-best-practices → next-cache-components
UI Polish:         frontend-design → web-design-guidelines
Code Quality:      (implement feature) → check Quality Gates
Research:          firecrawl:firecrawl-cli → (implement with findings)
New Skill:         skill-creator:skill-creator
```

## 10. Subagent Delegation Guidelines

When delegating tasks to subagents via the Agent tool, **always include skill loading instructions** in the prompt.

### Required Skill Loading Format

At the beginning of every subagent prompt, include:

```
**LOAD THESE SKILLS FIRST:**
1. `skill: <skill-name>` - Brief explanation of why
2. `skill: <skill-name>` - Brief explanation of why
```

### Skill Selection

**Reference Section 7 (Skill Discovery — Intent Table)** to select appropriate skills. Common combinations:

- **UI components** → `tailwind-css-patterns` + `frontend-design` + `vercel-composition-patterns`
- **Next.js features** → `next-best-practices` + `vercel-react-best-practices`
- **Concept content** → `vercel-react-native-skills`
- **Design review** → `frontend-design` + `web-design-guidelines`

**Critical:** Subagents cannot load skills after starting. All required skills must be declared upfront.

## 11. Key Files Reference

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout (providers, fonts, global styles) |
| `app/page.tsx` | Main playground page (client component orchestrator) |
| `components/PlaygroundShell.tsx` | 3-column layout |
| `components/CodeEditor.tsx` | CodeMirror 6 + clickable decorations |
| `components/ConceptPanel.tsx` | Concept walkthrough + MDX rendering |
| `components/SnackPreview.tsx` | snack-sdk iframe wrapper |
| `lib/analyzer.ts` | Babel AST → DetectedConcept[] (single merged traversal) |
| `lib/categories.ts` | Centralized category config (colors, labels) |
| `lib/detectors/index.ts` | Aggregates all visitor factories |
| `lib/codemirror-decorations.ts` | DetectedConcept[] → CM decorations |
| `lib/types.ts` | Shared TypeScript types (includes Locale, SUPPORTED_LOCALES) |
| `components/LanguageToggle.tsx` | Locale switcher (segmented control) |
| `content/concepts/{locale}/*.mdx` | Educational concept cards (per locale, English fallback) |
| `content/examples/*.ts` | Pre-loaded example apps |

## 12. Quality Gates

Before completing any task, all gates must pass:

| Gate | Command | Automated? |
|------|---------|------------|
| Type-check | `npm run check-types` | Yes — Stop hook runs `tsc --noEmit` automatically |
| Lint | `npm run lint` | No — run manually |
| Format | `npm run format` | Partial — auto-format hook handles Prettier |
| Build | `npm run build` | No — run manually |

## 13. Keeping AGENTS.md Current

**If your work changes any information in this file, update it before completing your task.**

Update this file when you:

- **Add or remove a skill** — Update the intent table (Section 7) and category list (Section 8).
- **Change architecture** — Update the directory map (Section 3) or key files (Section 11).
- **Add new dependencies or tooling** — Update the tech stack table (Section 2).
- **Change conventions** — Update code conventions (Section 5).
- **Add new commands or scripts** — Update build & dev commands (Section 4).
- **Add or change MCP servers** — Update MCP servers (Section 6).
- **Add or change hooks** — Update hook descriptions in code conventions (Section 5).

This keeps AGENTS.md as a living document maintained by the agents who use it.
