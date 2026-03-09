"use client";

import Link from "next/link";
import type { ConceptCard, DetectedConcept, Locale } from "@/lib/types";

const BROWSE_ALL_TEXT: Record<Locale, string> = {
  en: "Browse all →",
  es: "Ver todos →",
};

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
  locale?: Locale;
}

export default function ConceptList({
  concepts,
  activeConceptId,
  onConceptClick,
  cards,
  locale = "en",
}: ConceptListProps) {
  // Deduplicate by conceptId and only show concepts that have a matching card
  const seen = new Set<string>();
  const uniqueConcepts = concepts.filter((concept) => {
    if (seen.has(concept.conceptId)) return false;
    seen.add(concept.conceptId);
    return cards.has(concept.conceptId);
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
    <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-100 px-4 py-3">
      {uniqueConcepts.map((concept) => {
        const isActive = concept.conceptId === activeConceptId;
        const styles = CATEGORY_STYLES[concept.category] ?? DEFAULT_STYLE;

        return (
          <button
            key={concept.conceptId}
            type="button"
            onClick={() => onConceptClick(concept.conceptId)}
            className={[
              "cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-200 hover:shadow-sm active:scale-[0.97]",
              styles.border,
              styles.text,
              isActive ? styles.bgActive : styles.bg,
              isActive ? "ring-1 ring-current shadow-sm" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {concept.label}
          </button>
        );
      })}
      <Link
        href={`/${locale}/concepts`}
        className="rounded-full px-2 py-1 text-[10px] font-medium text-gray-400 transition-colors hover:text-blue-600"
      >
        {BROWSE_ALL_TEXT[locale] ?? BROWSE_ALL_TEXT.en}
      </Link>
    </div>
  );
}
