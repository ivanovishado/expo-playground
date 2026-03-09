import type { TraverseOptions } from "@babel/traverse";
import type { DetectedConcept } from "@/lib/types";
import { toConceptLocation } from "./utils";

/**
 * Creates a visitor that detects `export default` declarations.
 */
export function createExportsVisitor(
  concepts: DetectedConcept[]
): TraverseOptions {
  return {
    ExportDefaultDeclaration(path) {
      const loc = path.node.loc;
      if (!loc) return;

      concepts.push({
        conceptId: "export-default",
        label: "export default",
        category: "basics",
        location: toConceptLocation(loc),
        context: "default export declaration",
      });
    },
  };
}
