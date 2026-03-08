import type { TraverseOptions } from "@babel/traverse";
import type { DetectedConcept } from "@/lib/types";
import { toConceptLocation } from "./utils";

/**
 * Creates a visitor that detects import statements.
 * Identifies both `import ... from '...'` and `import '...'` forms.
 */
export function createImportsVisitor(
  concepts: DetectedConcept[]
): TraverseOptions {
  return {
    ImportDeclaration(path) {
      const { node } = path;
      const loc = node.loc;
      if (!loc) return;

      const source = node.source.value;
      const specifiers = node.specifiers
        .map((s) => {
          if (s.type === "ImportDefaultSpecifier") return s.local.name;
          if (s.type === "ImportNamespaceSpecifier")
            return `* as ${s.local.name}`;
          if (s.type === "ImportSpecifier") return s.local.name;
          return "";
        })
        .filter(Boolean);

      const label =
        specifiers.length > 0
          ? `Import: ${specifiers.join(", ")}`
          : `Import: ${source}`;

      concepts.push({
        conceptId: "import",
        label,
        category: "basics",
        location: toConceptLocation(loc),
        context: `importing from '${source}'`,
      });
    },
  };
}
