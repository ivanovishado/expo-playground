import type { ConceptCategory } from "./types";

/**
 * Centralized category configuration.
 * Single source of truth for category colors and labels.
 * Adding a new category only requires updating this map.
 */
export const CATEGORY_CONFIG: Record<
  ConceptCategory,
  { cssVar: string; label: string }
> = {
  basics: { cssVar: "--color-concept-basics", label: "Basics" },
  hooks: { cssVar: "--color-concept-hooks", label: "Hooks" },
  styling: { cssVar: "--color-concept-styling", label: "Styling" },
  events: { cssVar: "--color-concept-events", label: "Events" },
};
