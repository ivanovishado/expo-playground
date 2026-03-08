# VS Code Extension — Future Project

> Bring the Annotated Expo Playground experience directly into VS Code: concept highlights in the editor, walkthrough panels, and live Snack preview — all without leaving the IDE.

## Overview

The VS Code extension would replicate the three-column playground experience inside the editor:

1. **Concept highlights** — Inline decorations on detected concepts (imports, hooks, JSX, styles, etc.) directly in the editor gutter and text, color-coded by category.
2. **Walkthrough panel** — A webview panel that displays the same MDX concept cards when the user's cursor lands on a highlighted concept.
3. **Snack preview** — A webview panel running the Snack SDK to show a live preview of the current file.

**Target audience:** The same beginner students using the web playground, but in their actual development environment.

## Architecture

```
┌─────────────────────────────────────────────────┐
│  VS Code Extension Host (Node.js)               │
│                                                  │
│  ┌──────────────┐   ┌────────────────────────┐  │
│  │ AST Analysis  │   │ Decoration Provider     │  │
│  │ (Babel)       │──▶│ (vscode.decorations)   │  │
│  └──────────────┘   └────────────────────────┘  │
│         │                                        │
│         ▼                                        │
│  ┌──────────────┐   ┌────────────────────────┐  │
│  │ Concept       │   │ Snack SDK Host          │  │
│  │ Resolution    │   │ (snack-sdk in Node.js)  │  │
│  └──────┬───────┘   └──────────┬─────────────┘  │
│         │                      │                 │
└─────────┼──────────────────────┼─────────────────┘
          │                      │
          ▼                      ▼
   ┌─────────────┐      ┌──────────────┐
   │ Walkthrough  │      │ Snack Preview │
   │ Webview      │      │ Webview       │
   │ (MDX render) │      │ (iframe)      │
   └─────────────┘      └──────────────┘
```

### Extension Host (Node.js)

- Runs Babel AST analysis on the active file (same `@babel/parser` + `@babel/traverse` pipeline).
- Manages VS Code decoration types (one per category: basics=blue, hooks=purple, styling=green, events=orange).
- Listens for cursor position changes to resolve which concept the user is on.
- Hosts the Snack SDK session (if feasible — see Risks below).

### Webview Panels

- **Walkthrough panel**: Renders MDX concept cards using `markdown-it` (since `next-mdx-remote` depends on React/Next.js, a lightweight Markdown renderer is more appropriate for webviews).
- **Snack preview panel**: Embeds the Snack web runtime in an iframe, similar to the web playground.

## Code Reuse from Web Playground

The following modules port directly with minimal or no changes:

| Module | Path | Notes |
|--------|------|-------|
| AST analyzer | `lib/analyzer.ts` | Core analysis — runs in Node.js as-is |
| Concept detectors | `lib/detectors/*` | All visitor factories are pure functions |
| Type definitions | `lib/types.ts` | Shared `DetectedConcept`, `ConceptLocation`, etc. |
| Category config | `lib/categories.ts` | Colors, labels, category metadata |
| MDX content | `content/concepts/*.mdx` | Bundle as extension assets |

**What doesn't port:**
- `lib/codemirror-decorations.ts` — Replace with VS Code's `vscode.window.createTextEditorDecorationType`
- `components/*` — React components replaced by webview HTML/JS
- `lib/concept-loader.ts` — Replace with `vscode.workspace.fs` + `markdown-it`

## Key Design Decisions

### Cursor-position interaction (not click)

VS Code's decoration API does not support click event handlers on decorations. Instead, use `vscode.window.onDidChangeTextEditorSelection` to detect when the cursor enters a decorated range and update the walkthrough panel accordingly. This is actually a smoother UX — the panel updates as the user navigates code, no clicking required.

### MDX rendering in webviews

Since `next-mdx-remote` requires a React runtime, use `markdown-it` with a few plugins (`markdown-it-highlightjs` for code blocks) to render concept cards in the webview. Strip JSX-specific MDX features and keep content as standard Markdown with frontmatter.

### Snack SDK in Node.js

The Snack SDK is designed for browser environments. Running it in Node.js (extension host) may require:
- Polyfilling `window`, `document`, and `postMessage`
- Or running it inside the webview's browser context and communicating via `vscode.postMessage`

The webview approach is more reliable — the webview already has a browser environment.

### File watching and debounce

Use `vscode.workspace.onDidChangeTextDocument` with a debounce (~1s, matching the web playground) to re-run AST analysis and update decorations. The Snack SDK's built-in `codeChangesDelay` handles preview debouncing.

## Risks

### 1. Snack SDK browser globals (High)

The Snack SDK assumes browser APIs (`WebSocket`, `window`, `postMessage`). Running in Node.js requires polyfills or running the SDK inside the webview.

**Mitigation:** Run Snack SDK in the webview panel's browser context. The extension host sends code updates via `panel.webview.postMessage()`, and the webview manages the Snack session.

**Fallback:** If the SDK doesn't work reliably in webviews either, fall back to generating a static Snack URL (using the same `buildSnackUrl` helper from the web playground) and opening it in the user's browser.

### 2. Performance with large files (Medium)

Babel parsing on every keystroke could be expensive for large files. The 1s debounce helps, but files with 500+ lines may cause noticeable lag.

**Mitigation:** Cache the last AST and only re-parse when the document actually changes. Consider incremental parsing if Babel supports it, or limit analysis to the visible viewport range.

### 3. MDX content bundling (Low)

Bundling ~15 MDX files as extension assets adds to extension size but is manageable (<1MB total).

## Effort Estimate

| Component | Days | Description |
|-----------|------|-------------|
| Project scaffolding | 1 | Extension boilerplate, build pipeline, packaging |
| AST integration | 1-2 | Port analyzer + detectors, wire to decoration API |
| Decoration rendering | 1-2 | Category-colored decorations, cursor tracking |
| Walkthrough webview | 2-3 | Webview panel, markdown-it rendering, concept navigation |
| Snack preview webview | 2-3 | Snack SDK in webview, postMessage bridge, fallback URL |
| Testing and polish | 1-2 | Edge cases, error handling, activation events |
| **Total** | **~9-12 days** | |

## Getting Started

When ready to build this extension:

1. Scaffold with `yo code` (TypeScript template)
2. Copy `lib/analyzer.ts`, `lib/detectors/*`, `lib/types.ts`, `lib/categories.ts` into the extension's `src/`
3. Implement `DecorationProvider` using `vscode.window.createTextEditorDecorationType`
4. Build the walkthrough webview with `markdown-it` + bundled concept MDX
5. Prototype the Snack preview in a webview before attempting Node.js integration
