import type { SourceLocation } from "@babel/types";
import type { ConceptLocation } from "@/lib/types";

/**
 * Converts a Babel SourceLocation to a ConceptLocation.
 * Babel lines are 1-indexed, columns are 0-indexed — both match
 * the ConceptLocation interface directly.
 */
export function toConceptLocation(loc: SourceLocation): ConceptLocation {
  return {
    startLine: loc.start.line,
    endLine: loc.end.line,
    startCol: loc.start.column,
    endCol: loc.end.column,
  };
}
