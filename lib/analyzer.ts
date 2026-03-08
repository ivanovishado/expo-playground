import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import type { DetectedConcept } from "@/lib/types";
import { detectorFactories } from "./detectors";

/**
 * Parses student code with Babel and runs all concept detectors
 * in a single merged AST traversal.
 *
 * Returns an array of detected concepts with source locations.
 * On syntax errors, returns an empty array (students often paste
 * incomplete code while editing).
 */
export function analyzeCode(code: string): DetectedConcept[] {
  let ast;
  try {
    ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });
  } catch {
    // Syntax errors are expected — students paste partial code
    return [];
  }

  const concepts: DetectedConcept[] = [];
  const visitors = detectorFactories.map((factory) => factory(concepts));
  traverse(ast, traverse.visitors.merge(visitors));

  return concepts;
}
