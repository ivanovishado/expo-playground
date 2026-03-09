import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import type { DetectedConcept } from "@/lib/types";
import { detectorFactories } from "./detectors";

/** The foundational concept that is always visible */
const PROGRAMMING_BASICS: DetectedConcept = {
  conceptId: "programming-basics",
  label: "Programming Basics",
  category: "basics",
  location: { startLine: 1, endLine: 1 },
};

/**
 * Parses student code with Babel and runs all concept detectors
 * in a single merged AST traversal.
 *
 * Returns an array of detected concepts with source locations.
 * The "programming-basics" concept is always included so the
 * foundational card is accessible regardless of code content.
 * On syntax errors, returns only the programming-basics concept
 * (students often paste incomplete code while editing).
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
    return [PROGRAMMING_BASICS];
  }

  const concepts: DetectedConcept[] = [];
  const visitors = detectorFactories.map((factory) => factory(concepts));
  traverse(ast, traverse.visitors.merge(visitors));

  concepts.unshift(PROGRAMMING_BASICS);

  return concepts;
}
