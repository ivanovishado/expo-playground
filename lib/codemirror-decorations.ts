import { RangeSetBuilder, type Text } from "@codemirror/state";
import { Decoration, type DecorationSet } from "@codemirror/view";
import type { DetectedConcept } from "@/lib/types";

/**
 * Converts a DetectedConcept's 1-indexed Babel location to a
 * CodeMirror absolute character offset range.
 *
 * Babel lines are 1-indexed; CM's `doc.line(n)` also takes 1-indexed
 * line numbers. Babel columns are 0-indexed, matching CM's column
 * convention. We combine `line.from + col` to get absolute offsets.
 */
function conceptToRange(
  concept: DetectedConcept,
  doc: Text
): { from: number; to: number } | null {
  const { startLine, endLine, startCol, endCol } = concept.location;

  if (startLine < 1 || startLine > doc.lines) return null;
  if (endLine < 1 || endLine > doc.lines) return null;

  const lineStart = doc.line(startLine);
  const lineEnd = doc.line(endLine);

  const from = startCol != null ? lineStart.from + startCol : lineStart.from;
  const to = endCol != null ? lineEnd.from + endCol : lineEnd.to;

  return {
    from: Math.max(0, Math.min(from, doc.length)),
    to: Math.max(0, Math.min(to, doc.length)),
  };
}

/**
 * Builds a CodeMirror DecorationSet from detected concepts.
 *
 * Each concept becomes a `Decoration.mark` with:
 * - CSS class `.cm-concept-{category}` for color-coded highlighting
 * - CSS class `.cm-concept-active` when the concept matches `activeConceptId`
 * - `data-concept-id` attribute for click detection in the DOM
 */
export function buildDecorations(
  concepts: ReadonlyArray<DetectedConcept>,
  activeConceptId: string | null,
  doc: Text
): DecorationSet {
  const ranges: Array<{
    from: number;
    to: number;
    decoration: Decoration;
  }> = [];

  for (const concept of concepts) {
    const range = conceptToRange(concept, doc);
    if (!range || range.from >= range.to) continue;

    const classes = ["cm-concept"];
    if (concept.conceptId === activeConceptId) {
      classes.push("cm-concept-active");
    }

    const decoration = Decoration.mark({
      class: classes.join(" "),
      attributes: {
        "data-concept-id": concept.conceptId,
        style: `--concept-color: var(--color-concept-${concept.category})`,
      },
    });

    ranges.push({ from: range.from, to: range.to, decoration });
  }

  // RangeSetBuilder requires ranges added in sorted order by `from`
  ranges.sort((a, b) => a.from - b.from || a.to - b.to);

  const builder = new RangeSetBuilder<Decoration>();
  for (const { from, to, decoration } of ranges) {
    builder.add(from, to, decoration);
  }

  return builder.finish();
}
