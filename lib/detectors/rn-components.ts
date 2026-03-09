import type { TraverseOptions } from "@babel/traverse";
import type { DetectedConcept, ConceptCategory } from "@/lib/types";
import { toConceptLocation } from "./utils";

/** Map of RN component names to their concept metadata */
const COMPONENT_MAP: Record<
  string,
  { conceptId: string; category: ConceptCategory }
> = {
  View: { conceptId: "view", category: "basics" },
  Text: { conceptId: "text", category: "basics" },
  Image: { conceptId: "image", category: "basics" },
  ScrollView: { conceptId: "scrollview", category: "basics" },
  Pressable: { conceptId: "touchable", category: "events" },
  TouchableOpacity: { conceptId: "touchable", category: "events" },
  TouchableHighlight: { conceptId: "touchable", category: "events" },
  TouchableNativeFeedback: { conceptId: "touchable", category: "events" },
};

/**
 * Creates a visitor that detects React Native core components
 * (View, Text, Image, ScrollView, and touchable variants).
 */
export function createRNComponentsVisitor(
  concepts: DetectedConcept[]
): TraverseOptions {
  return {
    JSXOpeningElement(path) {
      const { node } = path;
      const nameNode = node.name;
      if (nameNode.type !== "JSXIdentifier") return;

      const match = COMPONENT_MAP[nameNode.name];
      if (!match) return;

      const loc = node.loc;
      if (!loc) return;

      concepts.push({
        conceptId: match.conceptId,
        label: `<${nameNode.name}>`,
        category: match.category,
        location: toConceptLocation(loc),
        context: `${nameNode.name} component`,
      });
    },
  };
}
