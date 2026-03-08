# Annotated Expo Playground — Educational Code Tool

## Context

A mentor for a Technovation Girls team needs a tool to help beginner students understand LLM-generated Expo/React Native code. Students generate code via ChatGPT/Claude, paste it into the playground, and the system automatically detects programming concepts, highlights them in the code, and provides guided educational walkthroughs. The code highlights are clickable — clicking a highlighted region navigates to that concept's explanation.

No such tool exists today: Expo Snack runs code but doesn't educate. Code Hike annotates code but is static/read-only. This tool bridges the gap.

## Architecture Overview

```
┌──────────────────┬──────────────────┬──────────────────┐
│  CONCEPT PANEL   │  CODE EDITOR     │  LIVE PREVIEW    │
│                  │  (CodeMirror 6)  │  (Snack SDK)     │
│  Walkthrough of  │                  │                  │
│  detected        │  Student pastes  │  Runs the code   │
│  concept with    │  code here.      │  as a live       │
│  explanation     │                  │  React Native    │
│  from Expo docs. │  Highlighted     │  app.            │
│                  │  regions are     │                  │
│  [← Prev] [Next →] │  clickable →     │                  │
│                  │  navigates to    │                  │
│  Concept list:   │  concept in the  │                  │
│  ● import        │  left panel.     │                  │
│  ○ useState      │                  │                  │
│  ○ JSX           │                  │                  │
│  ○ StyleSheet    │                  │                  │
└──────────────────┴──────────────────┴──────────────────┘
```

**Three columns, all visible simultaneously:**
- **Left**: Concept walkthrough — educational content (from Expo docs) + navigation
- **Center**: Code editor — paste code, see clickable highlights
- **Right**: Live Snack preview — see the app running

## Interaction Flow

1. Student pastes code into CodeMirror editor (or picks a pre-loaded example like "Counter App", "Todo List", "Profile Card")
2. Babel parser analyzes AST, detects concepts (imports, hooks, components, JSX, styles, events, etc.)
3. Each detected concept gets a colored highlight in the editor (different colors per category)
4. The walkthrough panel shows the first concept (suggested order: top-to-bottom or simple-to-complex)
5. Student can:
   - **Click any highlight in the code** → panel jumps to that concept
   - **Use Prev/Next buttons** → sequential walkthrough
   - **Click concept list items** → jump to any concept
6. When a concept is active, its code region is prominently highlighted; other regions are subtly marked
7. Live Snack preview runs the code simultaneously, updating on edits

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router, Turbopack) | SSR, file-based routing, React 19 |
| Editor | CodeMirror 6 (`@uiw/react-codemirror` 4.25) | Editable code with clickable decorations |
| AST Analysis | `@babel/parser` + `@babel/traverse` 7.29 | Detect concepts in pasted code |
| Live Preview | `snack-sdk` 6.6 | Run RN code in iframe |
| Concept Content | Snapshots from Expo docs (stored as MDX) | Reuse existing documentation, OK if stale for MVP |
| Styling | Tailwind CSS 4 | CSS-first config, utility styling |
| Deploy | Vercel | Zero-config |

**No backend, no database, no auth for MVP.**

## Core Components

### 1. AST Concept Analyzer (`lib/analyzer.ts`)

Parses code with Babel, traverses AST, returns detected concepts with locations:

```typescript
interface DetectedConcept {
  conceptId: string;          // e.g., "useState", "import", "jsx-element"
  label: string;              // e.g., "useState Hook"
  category: ConceptCategory;  // "hooks" | "basics" | "styling" | "events" | ...
  location: {
    startLine: number;
    endLine: number;
    startCol?: number;
    endCol?: number;
  };
  context?: string;           // e.g., "importing View from react-native"
}

function analyzeCode(code: string): DetectedConcept[]
```

**Detectors to implement (MVP):**
- `import` statements → what's being imported and from where
- Component function declarations (default export, arrow function)
- JSX elements (View, Text, Image, TouchableOpacity, etc.)
- Hooks: `useState`, `useEffect`
- `StyleSheet.create` and inline styles
- Event handlers (`onPress`, `onChangeText`, etc.)
- Props usage

### 2. Concept Library (`content/concepts/*.mdx`)

Content sourced from Expo's open-source docs (MIT-licensed). Each concept is an MDX file with structured frontmatter + curated excerpts from relevant Expo/React Native doc pages:

```mdx
---
id: "useState"
title: "useState Hook"
category: "hooks"
order: 2
color: "#8B5CF6"
expoDocUrl: "https://docs.expo.dev/develop/user-interface/store-data/#use-state"
---

## What is useState?

`useState` is a React Hook that lets you add a state variable
to your component...

## Try This

Change `useState(0)` to `useState(100)` — what happens in the preview?
```

**MVP concept library (~15 concepts):**
- Basics: `import`, `export-default`, `component-function`, `jsx`, `props`
- Hooks: `useState`, `useEffect`
- UI: `view`, `text`, `image`, `touchable`, `scrollview`
- Styling: `stylesheet`, `inline-styles`, `flexbox`
- Events: `onPress`, `onChangeText`

Content is snapshotted from Expo docs at build time — it's fine if it goes stale for MVP.

### 3. CodeMirror with Clickable Highlights (`components/CodeEditor.tsx`)

Uses CodeMirror 6's decoration API:
- `Decoration.mark()` with CSS classes per concept category (color-coded)
- Click handler on marks → dispatches `onConceptClick(conceptId)`
- Active concept gets a prominent highlight; others get subtle background
- Hover tooltip shows concept name as a preview

Key: `@codemirror/view`'s `EditorView.domEventHandlers` for click detection on decorated ranges.

### 4. Concept Walkthrough Panel (`components/ConceptPanel.tsx`)

- Renders the active concept's MDX content (sourced from Expo docs)
- Prev/Next navigation buttons
- Concept list (dots/chips) showing all detected concepts, with active state
- Link to full Expo doc page for deeper reading
- Smooth transitions between concepts

### 5. Snack Preview (`components/SnackPreview.tsx`)

- `snack-sdk` instance created on mount
- `snack.updateFiles()` called on editor changes (debounced ~1s)
- iframe renders the web preview
- Error display for runtime errors

### 6. Example Picker (`components/ExamplePicker.tsx`)

- 3-4 pre-loaded example apps (Counter, Todo List, Profile Card)
- Loads sample code into the editor for students who haven't generated code yet
- Shown as buttons above the editor or as a welcome screen

### 7. Main Playground Page (`app/page.tsx`)

Client component orchestrating:
- `analyzeCode()` on paste/edit (debounced)
- State: `detectedConcepts`, `activeConceptId`, `code`
- Passes concept click handler to editor
- Passes active concept to panel

## Project Structure

```
app/
  layout.tsx                      # Root layout
  page.tsx                        # Main playground page
components/
  PlaygroundShell.tsx             # 3-column layout orchestrator
  CodeEditor.tsx                  # CodeMirror + clickable concept highlights
  ConceptPanel.tsx                # Walkthrough panel + navigation
  ConceptList.tsx                 # Clickable concept chips/dots
  SnackPreview.tsx                # snack-sdk iframe wrapper
  ExamplePicker.tsx               # Pre-loaded example buttons
lib/
  analyzer.ts                     # Babel AST → DetectedConcept[]
  detectors/                      # Individual concept detectors
    imports.ts
    hooks.ts
    components.ts
    jsx-elements.ts
    styles.ts
    events.ts
    index.ts                      # Aggregates all detectors
  concept-loader.ts               # Loads MDX concept cards
  codemirror-decorations.ts       # DetectedConcept[] → CM decorations
  types.ts                        # Shared types
content/
  concepts/                       # ~15 MDX files sourced from Expo docs
    import.mdx
    component-function.mdx
    jsx.mdx
    useState.mdx
    useEffect.mdx
    stylesheet.mdx
    ...
  examples/                       # Pre-loaded example apps
    counter.ts
    todo-list.ts
    profile-card.ts
```

## Dependencies

```json
{
  "dependencies": {
    "next": "^16.1.6",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "@uiw/react-codemirror": "^4.25.8",
    "@codemirror/lang-javascript": "^6.2.5",
    "@codemirror/view": "^6.39.16",
    "@babel/parser": "^7.29.0",
    "@babel/traverse": "^7.29.0",
    "snack-sdk": "^6.6.1",
    "next-mdx-remote": "^6.0.0",
    "tailwindcss": "^4.2.1"
  }
}
```

12 dependencies. No backend. No database.

**Note**: Next.js 16 uses React 19 and Turbopack by default. Tailwind CSS v4 uses a new CSS-first config approach (no `tailwind.config.ts`).

## MVP Scope

### In scope
- Paste code → AST detection → clickable highlights → concept walkthrough
- ~15 concept cards with content sourced from Expo docs
- 3-4 pre-loaded example apps for students without generated code
- Live Snack preview running the pasted code
- Prev/Next walkthrough + click-to-jump on highlights in code
- Color-coded categories (basics=blue, hooks=purple, styling=green, events=orange)
- 3-column layout (concept panel | code editor | live preview)
- Deploy to Vercel

### Out of scope (future phases)
- LLM "explain this" button for unknown concepts
- Progress tracking / student accounts
- Collaborative editing
- Lesson authoring UI for mentors
- Mobile-responsive layout
- Custom concept card creation by students
- Code diffing ("check my work" against reference)

## Verification Plan

1. **Unit test the analyzer**: Pass known code snippets → assert correct concepts detected with accurate line numbers
2. **Visual test highlights**: Paste sample Expo code → verify all concepts get colored highlights at correct positions
3. **Click interaction**: Click each highlight → verify panel navigates to correct concept
4. **Snack preview**: Paste valid Expo code → verify live preview renders correctly
5. **Edge cases**: Empty code, syntax errors, code without any known concepts, very long files
6. **End-to-end**: Paste a real LLM-generated Expo app → walkthrough all detected concepts → verify educational value

## Implementation Order

1. Project scaffold (Next.js + Tailwind + CodeMirror)
2. AST analyzer with 3-4 basic detectors (import, component, jsx, useState)
3. CodeMirror with clickable decorations (hardcoded test data first)
4. Concept panel with MDX rendering
5. Wire analyzer → decorations → panel (the full loop)
6. Snack SDK preview integration
7. Pre-loaded example apps
8. Write remaining concept cards sourced from Expo docs (~15 total)
9. Polish UI, colors, transitions
10. Deploy to Vercel
