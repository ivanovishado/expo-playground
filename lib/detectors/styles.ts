import type { TraverseOptions } from "@babel/traverse";
import type { DetectedConcept } from "@/lib/types";
import { toConceptLocation } from "./utils";

/**
 * Creates a visitor that detects styling patterns:
 * - `StyleSheet.create(...)` calls
 * - Inline `style={{ ... }}` JSX attributes
 */
export function createStylesVisitor(
  concepts: DetectedConcept[]
): TraverseOptions {
  return {
    CallExpression(path) {
      const { node } = path;
      const callee = node.callee;

      if (
        callee.type === "MemberExpression" &&
        callee.object.type === "Identifier" &&
        callee.object.name === "StyleSheet" &&
        callee.property.type === "Identifier" &&
        callee.property.name === "create"
      ) {
        const loc = node.loc;
        if (!loc) return;

        concepts.push({
          conceptId: "stylesheet",
          label: "StyleSheet.create",
          category: "styling",
          location: toConceptLocation(loc),
          context: "creating a reusable style object",
        });
      }
    },

    JSXAttribute(path) {
      const { node } = path;
      if (node.name.type !== "JSXIdentifier" || node.name.name !== "style") {
        return;
      }

      // Inline style: style={{ ... }}
      if (
        node.value &&
        node.value.type === "JSXExpressionContainer" &&
        node.value.expression.type === "ObjectExpression"
      ) {
        const loc = node.loc;
        if (!loc) return;

        concepts.push({
          conceptId: "inline-style",
          label: "Inline Style",
          category: "styling",
          location: toConceptLocation(loc),
          context: "inline style object on a JSX element",
        });
      }
    },
  };
}
