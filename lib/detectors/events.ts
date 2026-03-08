import type { TraverseOptions } from "@babel/traverse";
import type { DetectedConcept } from "@/lib/types";
import { toConceptLocation } from "./utils";

/** Event handler prop names we detect */
const EVENT_PROPS: Record<string, string> = {
  onPress: "Press event handler",
  onChangeText: "Text change event handler",
  onLongPress: "Long press event handler",
  onSubmitEditing: "Submit editing event handler",
};

/**
 * Creates a visitor that detects event handler JSX attributes
 * like onPress, onChangeText, etc.
 */
export function createEventsVisitor(
  concepts: DetectedConcept[]
): TraverseOptions {
  return {
    JSXAttribute(path) {
      const { node } = path;
      if (node.name.type !== "JSXIdentifier") return;

      const propName = node.name.name;
      const description = EVENT_PROPS[propName];
      if (!description) return;

      const loc = node.loc;
      if (!loc) return;

      // Try to get the parent element name for context
      let elementName = "element";
      const openingElement = path.parentPath;
      if (openingElement && openingElement.node.type === "JSXOpeningElement") {
        const nameNode = openingElement.node.name;
        if (nameNode.type === "JSXIdentifier") {
          elementName = nameNode.name;
        }
      }

      concepts.push({
        conceptId: propName,
        label: description,
        category: "events",
        location: toConceptLocation(loc),
        context: `${propName} on <${elementName}>`,
      });
    },
  };
}
