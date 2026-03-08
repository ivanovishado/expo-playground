import type { TraverseOptions } from "@babel/traverse";
import type { DetectedConcept } from "@/lib/types";
import { toConceptLocation } from "./utils";

/**
 * Creates a visitor that detects JSX elements (e.g. <View>, <Text>, <Pressable>).
 * Only detects opening tags to avoid duplicate detections for self-closing elements.
 */
export function createJSXElementsVisitor(
  concepts: DetectedConcept[]
): TraverseOptions {
  return {
    JSXOpeningElement(path) {
      const { node } = path;
      const loc = node.loc;
      if (!loc) return;

      const nameNode = node.name;
      let elementName: string;

      if (nameNode.type === "JSXIdentifier") {
        elementName = nameNode.name;
      } else if (nameNode.type === "JSXMemberExpression") {
        elementName = buildMemberName(nameNode);
      } else {
        return;
      }

      concepts.push({
        conceptId: "jsx",
        label: `JSX: <${elementName}>`,
        category: "basics",
        location: toConceptLocation(loc),
        context: `JSX element ${elementName}`,
      });
    },
  };
}

/**
 * Recursively builds a dotted name from a JSXMemberExpression.
 * e.g. `MyModule.SubComponent` → "MyModule.SubComponent"
 */
function buildMemberName(node: {
  type: string;
  object: { type: string; name?: string; object?: unknown; property?: unknown };
  property: { type: string; name: string };
}): string {
  if (node.object.type === "JSXIdentifier") {
    return `${node.object.name}.${node.property.name}`;
  }
  if (node.object.type === "JSXMemberExpression") {
    return `${buildMemberName(node.object as Parameters<typeof buildMemberName>[0])}.${node.property.name}`;
  }
  return node.property.name;
}
