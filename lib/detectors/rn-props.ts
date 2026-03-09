import type { TraverseOptions } from "@babel/traverse";
import type { DetectedConcept } from "@/lib/types";
import { toConceptLocation } from "./utils";

/** Attribute names to exclude (handled by other detectors or not props) */
const EXCLUDED_ATTRIBUTES = new Set([
  "style",
  "key",
  "ref",
  "onPress",
  "onChangeText",
  "onLongPress",
  "onSubmitEditing",
]);

/**
 * Creates a visitor that detects JSX props (attributes that aren't
 * style, key, ref, or known event handlers).
 */
export function createPropsVisitor(
  concepts: DetectedConcept[]
): TraverseOptions {
  return {
    JSXAttribute(path) {
      const { node } = path;
      if (node.name.type !== "JSXIdentifier") return;

      const attrName = node.name.name;
      if (EXCLUDED_ATTRIBUTES.has(attrName)) return;

      const loc = node.loc;
      if (!loc) return;

      concepts.push({
        conceptId: "props",
        label: `prop: ${attrName}`,
        category: "basics",
        location: toConceptLocation(loc),
        context: `${attrName} prop`,
      });
    },
  };
}
