import type { TraverseOptions } from "@babel/traverse";
import type { DetectedConcept } from "@/lib/types";
import { toConceptLocation } from "./utils";

/** Style property names that indicate flexbox usage */
const FLEXBOX_KEYS = new Set([
  "flex",
  "flexDirection",
  "justifyContent",
  "alignItems",
  "alignSelf",
  "flexWrap",
  "gap",
  "rowGap",
  "columnGap",
]);

/**
 * Creates a visitor that detects flexbox layout usage by finding
 * flexbox-specific style properties in inline styles and StyleSheet.create.
 */
export function createFlexboxVisitor(
  concepts: DetectedConcept[]
): TraverseOptions {
  let detected = false;

  return {
    ObjectProperty(path) {
      if (detected) return;

      const { node } = path;
      if (node.key.type !== "Identifier") return;
      if (!FLEXBOX_KEYS.has(node.key.name)) return;

      const loc = node.loc;
      if (!loc) return;

      detected = true;
      concepts.push({
        conceptId: "flexbox",
        label: "Flexbox Layout",
        category: "styling",
        location: toConceptLocation(loc),
        context: `${node.key.name} style property`,
      });
    },
  };
}
