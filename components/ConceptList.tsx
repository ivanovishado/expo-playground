"use client";

import type { ConceptCard, DetectedConcept } from "@/lib/types";

const CATEGORY_STYLES: Record<
  string,
  { bg: string; bgActive: string; text: string; border: string }
> = {
  basics: {
    bg: "bg-concept-basics-bg",
    bgActive: "bg-concept-basics-bg-active",
    text: "text-concept-basics",
    border: "border-concept-basics",
  },
  hooks: {
    bg: "bg-concept-hooks-bg",
    bgActive: "bg-concept-hooks-bg-active",
    text: "text-concept-hooks",
    border: "border-concept-hooks",
  },
  styling: {
    bg: "bg-concept-styling-bg",
    bgActive: "bg-concept-styling-bg-active",
    text: "text-concept-styling",
    border: "border-concept-styling",
  },
  events: {
    bg: "bg-concept-events-bg",
    bgActive: "bg-concept-events-bg-active",
    text: "text-concept-events",
    border: "border-concept-events",
  },
};

const DEFAULT_STYLE = CATEGORY_STYLES.basics;

interface ConceptListProps {
  concepts: DetectedConcept[];
  activeConceptId: string | null;
  onConceptClick: (conceptId: string) => void;
  cards: Map<string, ConceptCard>;
}

export default function ConceptList({
  concepts,
  activeConceptId,
  onConceptClick,
  cards,
}: ConceptListProps) {
  // Deduplicate by conceptId — multiple AST nodes can map to the same concept
  const seen = new Set<string>();
  const uniqueConcepts = concepts.filter((concept) => {
    if (seen.has(concept.conceptId)) return false;
    seen.add(concept.conceptId);
    return true;
  });

  if (uniqueConcepts.length === 0) {
    return (
      <div className="px-4 py-3">
        <p className="text-xs text-gray-400">
          Paste or edit code to detect concepts.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5 border-b border-gray-100 px-4 py-3">
      {uniqueConcepts.map((concept) => {
        const isActive = concept.conceptId === activeConceptId;
        const hasCard = cards.has(concept.conceptId);
        const styles = CATEGORY_STYLES[concept.category] ?? DEFAULT_STYLE;

        return (
          <button
            key={concept.conceptId}
            type="button"
            onClick={() => onConceptClick(concept.conceptId)}
            disabled={!hasCard}
            className={[
              "rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-200",
              styles.border,
              styles.text,
              isActive ? styles.bgActive : styles.bg,
              isActive ? "ring-1 ring-current shadow-sm" : "",
              hasCard
                ? "cursor-pointer hover:shadow-sm active:scale-[0.97]"
                : "cursor-default opacity-40",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {concept.label}
          </button>
        );
      })}
    </div>
  );
}
