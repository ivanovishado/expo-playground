"use client";

import type { ConceptCard } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/categories";

interface ConceptPanelProps {
  card: ConceptCard | null;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export default function ConceptPanel({
  card,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: ConceptPanelProps) {
  if (!card) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
          📘
        </div>
        <h2 className="mb-1.5 text-base font-semibold text-gray-800">
          Learn as You Explore
        </h2>
        <p className="max-w-[220px] text-[13px] leading-relaxed text-gray-500">
          Click a{" "}
          <span className="rounded bg-blue-50 px-1 py-0.5 text-xs font-medium text-blue-600">
            highlighted concept
          </span>{" "}
          in the code or pick a concept chip above to start learning!
        </p>
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
        <h2 className="text-sm font-semibold text-gray-900">{card.title}</h2>
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
      <div className="concept-prose flex-1 overflow-y-auto px-4 py-4 text-[13px] leading-relaxed text-gray-700">
        {card.content}
      </div>

      {/* Footer: navigation + docs link */}
      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2">
        <div className="flex gap-0.5">
          <button
            type="button"
            onClick={onPrev}
            disabled={!hasPrev}
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
          >
            ← Prev
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
          >
            Next →
          </button>
        </div>

        <a
          href={card.expoDocUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md px-2 py-1 text-xs font-medium transition-colors duration-150 hover:underline"
          style={{ color: accentColor }}
        >
          Expo Docs ↗
        </a>
      </div>
    </div>
  );
}
