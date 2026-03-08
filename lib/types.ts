/**
 * Shared types for the Annotated Expo Playground.
 *
 * IMPORTANT: Babel uses 1-indexed lines. CodeMirror uses 0-indexed lines.
 * `ConceptLocation` stores Babel's 1-indexed values. Conversion to CM
 * 0-indexed happens in `codemirror-decorations.ts`.
 */

export type ConceptCategory = "basics" | "hooks" | "styling" | "events";

export interface ConceptLocation {
  /** 1-indexed start line (Babel convention) */
  startLine: number;
  /** 1-indexed end line (Babel convention) */
  endLine: number;
  /** 0-indexed start column */
  startCol?: number;
  /** 0-indexed end column */
  endCol?: number;
}

export interface DetectedConcept {
  /** Unique concept identifier, e.g. "useState", "import", "jsx-element" */
  conceptId: string;
  /** Human-readable label, e.g. "useState Hook" */
  label: string;
  /** Category for color-coding */
  category: ConceptCategory;
  /** Source location in the code (1-indexed lines) */
  location: ConceptLocation;
  /** Optional context, e.g. "importing View from react-native" */
  context?: string;
}

export interface ConceptCard {
  /** Must match a DetectedConcept's conceptId */
  id: string;
  /** Display title */
  title: string;
  /** Category for color-coding */
  category: ConceptCategory;
  /** Sort order within walkthrough */
  order: number;
  /** Link to the official Expo docs page */
  expoDocUrl: string;
  /** Compiled MDX content (from next-mdx-remote) */
  content: React.ReactNode;
}

export interface ExampleApp {
  /** Unique identifier */
  id: string;
  /** Display name, e.g. "Counter App" */
  name: string;
  /** Short description */
  description: string;
  /** The full source code */
  code: string;
}

/**
 * Detector visitor factory used by the AST analyzer.
 * Each factory receives a shared concepts array and returns a Babel
 * traverse visitor. All visitors are merged into a single traversal.
 */
export type DetectorVisitor = (
  concepts: DetectedConcept[]
) => import("@babel/traverse").TraverseOptions;
