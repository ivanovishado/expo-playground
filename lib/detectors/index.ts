import type { DetectorVisitor } from "@/lib/types";
import { createImportsVisitor } from "./imports";
import { createComponentsVisitor } from "./components";
import { createJSXElementsVisitor } from "./jsx-elements";
import { createHooksVisitor } from "./hooks";
import { createStylesVisitor } from "./styles";
import { createEventsVisitor } from "./events";

/**
 * All concept detector visitor factories, aggregated in detection order.
 * Each factory receives a shared concepts array and returns a Babel
 * visitor object. All visitors are merged into a single AST traversal.
 */
export const detectorFactories: DetectorVisitor[] = [
  createImportsVisitor,
  createComponentsVisitor,
  createJSXElementsVisitor,
  createHooksVisitor,
  createStylesVisitor,
  createEventsVisitor,
];
