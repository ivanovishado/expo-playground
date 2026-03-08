import type { NodePath, TraverseOptions } from "@babel/traverse";
import type { Node } from "@babel/types";
import type { DetectedConcept } from "@/lib/types";
import { toConceptLocation } from "./utils";

/**
 * Creates a visitor that detects function components — functions that return JSX.
 * Handles function declarations, arrow functions assigned to variables,
 * and default-exported arrow functions.
 */
export function createComponentsVisitor(
  concepts: DetectedConcept[]
): TraverseOptions {
  return {
    FunctionDeclaration(path) {
      if (!returnsJSX(path) || !path.node.id) return;
      const loc = path.node.loc;
      if (!loc) return;

      concepts.push({
        conceptId: "component-function",
        label: `Component: ${path.node.id.name}`,
        category: "basics",
        location: toConceptLocation(loc),
        context: `function component ${path.node.id.name}`,
      });
    },

    VariableDeclarator(path) {
      const init = path.node.init;
      if (
        !init ||
        (init.type !== "ArrowFunctionExpression" &&
          init.type !== "FunctionExpression")
      ) {
        return;
      }

      if (!returnsJSX(path)) return;

      const id = path.node.id;
      if (id.type !== "Identifier") return;

      const loc = path.node.loc;
      if (!loc) return;

      concepts.push({
        conceptId: "component-function",
        label: `Component: ${id.name}`,
        category: "basics",
        location: toConceptLocation(loc),
        context: `arrow function component ${id.name}`,
      });
    },
  };
}

/**
 * Checks whether a function path contains a JSX return statement.
 * This uses an inner path.traverse() scoped to the function node —
 * it cannot be lifted into the outer visitor because it needs
 * function-level scope.
 */
function returnsJSX(path: NodePath<Node>): boolean {
  let found = false;
  path.traverse({
    JSXElement(innerPath) {
      found = true;
      innerPath.stop();
    },
    JSXFragment(innerPath) {
      found = true;
      innerPath.stop();
    },
  });
  return found;
}
