"use client";

import Link from "next/link";
import type { ConceptCard, Locale } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/categories";

const UI_TEXT: Record<
  Locale,
  {
    emptyHeading: string;
    emptyChipLabel: string;
    emptyBefore: string;
    emptyAfter: string;
    browseTutorials: string;
    browseTutorialsDesc: string;
    readFullTutorial: string;
    prev: string;
    next: string;
    expoDocs: string;
  }
> = {
  en: {
    emptyHeading: "Learn as You Explore",
    emptyChipLabel: "highlighted concept",
    emptyBefore: "Click a",
    emptyAfter: "in the code or pick a concept chip above to start learning!",
    browseTutorials: "Browse all tutorials",
    browseTutorialsDesc: "Read {count} concept guides with examples",
    readFullTutorial: "Read full tutorial →",
    prev: "← Prev",
    next: "Next →",
    expoDocs: "Expo Docs ↗",
  },
  es: {
    emptyHeading: "Aprende mientras exploras",
    emptyChipLabel: "concepto resaltado",
    emptyBefore: "Haz clic en un",
    emptyAfter:
      "en el código o elige un chip de concepto arriba para empezar a aprender.",
    browseTutorials: "Ver todos los tutoriales",
    browseTutorialsDesc: "Lee {count} guías de conceptos con ejemplos",
    readFullTutorial: "Leer tutorial completo →",
    prev: "← Anterior",
    next: "Siguiente →",
    expoDocs: "Docs de Expo ↗",
  },
};

interface ConceptPanelProps {
  card: ConceptCard | null;
  locale?: Locale;
  conceptCount?: number;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export default function ConceptPanel({
  card,
  locale = "en",
  conceptCount = 0,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: ConceptPanelProps) {
  const t = UI_TEXT[locale];

  if (!card) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-subtle text-xl">
          📘
        </div>
        <h2 className="mb-1.5 text-base font-semibold text-text-heading">
          {t.emptyHeading}
        </h2>
        <p className="max-w-[220px] text-[13px] leading-relaxed text-text-tertiary">
          {t.emptyBefore}{" "}
          <span className="rounded bg-accent-subtle px-1 py-0.5 text-xs font-medium text-accent">
            {t.emptyChipLabel}
          </span>{" "}
          {t.emptyAfter}
        </p>
        <Link
          href={`/${locale}/concepts`}
          className="mt-5 rounded-lg border border-border px-4 py-2.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-raised"
        >
          <span className="block font-semibold">{t.browseTutorials}</span>
          <span className="mt-0.5 block text-text-muted">
            {t.browseTutorialsDesc.replace("{count}", String(conceptCount))}
          </span>
        </Link>
      </div>
    );
  }

  const config = CATEGORY_CONFIG[card.category] ?? CATEGORY_CONFIG.basics;
  const accentColor = `var(${config.cssVar})`;

  return (
    <div className="flex h-full flex-col transition-opacity duration-200">
      {/* Header */}
      <div
        className="flex items-center gap-2.5 border-b-2 px-4 py-3"
        style={{ borderBottomColor: accentColor }}
      >
        <span
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
        <h2 className="text-sm font-semibold text-text-primary">
          {card.title}
        </h2>
        <span
          className="ml-auto rounded-md px-1.5 py-0.5 text-[10px] font-medium capitalize"
          style={{
            color: accentColor,
            backgroundColor: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
          }}
        >
          {card.category}
        </span>
      </div>

      {/* MDX Content */}
      <div className="concept-prose flex-1 overflow-y-auto px-4 py-4 leading-relaxed text-text-secondary">
        {card.content}
      </div>

      {/* Full tutorial link */}
      <div className="border-t border-border-subtle px-4 py-2">
        <Link
          href={`/${locale}/concepts/${card.id}`}
          className="block rounded-md bg-surface-raised px-3 py-2 text-center text-xs font-medium text-accent transition-colors hover:bg-surface-sunken"
        >
          {t.readFullTutorial}
        </Link>
      </div>

      {/* Footer: navigation + docs link */}
      <div className="flex items-center justify-between border-t border-border-subtle px-4 py-2">
        <div className="flex gap-0.5">
          <button
            type="button"
            onClick={onPrev}
            disabled={!hasPrev}
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors duration-150 hover:bg-surface-raised disabled:cursor-not-allowed disabled:text-text-muted"
          >
            {t.prev}
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors duration-150 hover:bg-surface-raised disabled:cursor-not-allowed disabled:text-text-muted"
          >
            {t.next}
          </button>
        </div>

        <a
          href={card.expoDocUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md px-2 py-1 text-xs font-medium transition-colors duration-150 hover:underline"
          style={{ color: accentColor }}
        >
          {t.expoDocs}
        </a>
      </div>
    </div>
  );
}
