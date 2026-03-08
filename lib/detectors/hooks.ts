import type { TraverseOptions } from "@babel/traverse";
import type { DetectedConcept } from "@/lib/types";
import { toConceptLocation } from "./utils";

/** Hook names we detect and their concept IDs */
const HOOK_MAP: Record<string, { conceptId: string; label: string }> = {
  useState: { conceptId: "useState", label: "useState Hook" },
  useEffect: { conceptId: "useEffect", label: "useEffect Hook" },
};

/**
 * Creates a visitor that detects React hook calls: useState and useEffect.
 * Matches direct calls like `useState(...)` and `useEffect(...)`.
 */
export function createHooksVisitor(
  concepts: DetectedConcept[]
): TraverseOptions {
  return {
    CallExpression(path) {
      const { node } = path;
      const callee = node.callee;

      let hookName: string | undefined;

      if (callee.type === "Identifier") {
        hookName = callee.name;
      } else if (
        callee.type === "MemberExpression" &&
        callee.property.type === "Identifier"
      ) {
        hookName = callee.property.name;
      }

      if (!hookName || !(hookName in HOOK_MAP)) return;

      const loc = node.loc;
      if (!loc) return;

      const hookInfo = HOOK_MAP[hookName];

      let context: string | undefined;
      if (hookName === "useState" && node.arguments.length > 0) {
        const arg = node.arguments[0];
        if (arg.type === "StringLiteral") {
          context = `initial value: "${arg.value}"`;
        } else if (arg.type === "NumericLiteral") {
          context = `initial value: ${arg.value}`;
        } else if (arg.type === "BooleanLiteral") {
          context = `initial value: ${arg.value}`;
        } else if (arg.type === "ArrayExpression") {
          context = "initial value: []";
        } else if (arg.type === "ObjectExpression") {
          context = "initial value: {}";
        }
      }

      if (hookName === "useEffect") {
        const depsArg = node.arguments[1];
        if (depsArg && depsArg.type === "ArrayExpression") {
          context =
            depsArg.elements.length === 0
              ? "runs once on mount (empty deps)"
              : `${depsArg.elements.length} dependency(ies)`;
        } else if (!depsArg) {
          context = "runs on every render (no deps)";
        }
      }

      concepts.push({
        conceptId: hookInfo.conceptId,
        label: hookInfo.label,
        category: "hooks",
        location: toConceptLocation(loc),
        context,
      });
    },
  };
}
