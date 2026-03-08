"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import type { ConceptCard, DetectedConcept } from "@/lib/types";
import { analyzeCode } from "@/lib/analyzer";
import examples from "@/content/examples";
import CodeEditor from "./CodeEditor";
import ConceptPanel from "./ConceptPanel";
import ConceptList from "./ConceptList";
import SnackPreview from "./SnackPreview";
import ExamplePicker from "./ExamplePicker";

interface PlaygroundShellProps {
  conceptCards: ConceptCard[];
}

export default function PlaygroundShell({
  conceptCards,
}: PlaygroundShellProps) {
  const cardsMap = useMemo(() => {
    const map = new Map<string, ConceptCard>();
    for (const card of conceptCards) {
      map.set(card.id, card);
    }
    return map;
  }, [conceptCards]);

  const initialCode = examples[0]?.code ?? "";

  const [code, setCode] = useState(initialCode);
  const [detectedConcepts, setDetectedConcepts] = useState<DetectedConcept[]>(
    () => analyzeCode(initialCode)
  );
  const [activeConceptId, setActiveConceptId] = useState<string | null>(null);

  // Debounced AST analysis on code changes
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const concepts = analyzeCode(code);
      setDetectedConcepts(concepts);

      // If active concept disappeared after code edit, reset
      setActiveConceptId((prev) => {
        if (!prev) return null;
        if (concepts.some((c) => c.conceptId === prev)) return prev;
        const firstWithCard = concepts.find((c) => cardsMap.has(c.conceptId));
        return firstWithCard?.conceptId ?? null;
      });
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [code, cardsMap]);

  // Navigable concepts: unique detected concepts that have a matching card
  const navigableConcepts = useMemo(() => {
    const seen = new Set<string>();
    return detectedConcepts
      .filter((c) => {
        if (seen.has(c.conceptId)) return false;
        seen.add(c.conceptId);
        return cardsMap.has(c.conceptId);
      })
      .map((c) => c.conceptId);
  }, [detectedConcepts, cardsMap]);

  const activeCard = activeConceptId
    ? (cardsMap.get(activeConceptId) ?? null)
    : null;

  const activeIndex = activeConceptId
    ? navigableConcepts.indexOf(activeConceptId)
    : -1;

  const handleConceptClick = useCallback((conceptId: string) => {
    setActiveConceptId(conceptId);
  }, []);

  const handlePrev = useCallback(() => {
    if (activeIndex > 0) {
      setActiveConceptId(navigableConcepts[activeIndex - 1]);
    }
  }, [activeIndex, navigableConcepts]);

  const handleNext = useCallback(() => {
    if (activeIndex < navigableConcepts.length - 1) {
      setActiveConceptId(navigableConcepts[activeIndex + 1]);
    }
  }, [activeIndex, navigableConcepts]);

  return (
    <>
      {/* Responsive fallback for narrow screens */}
      <div className="min-width-warning h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <div className="mb-3 text-4xl">📱</div>
        <h2 className="mb-2 text-lg font-semibold text-gray-700">
          Wider Screen Needed
        </h2>
        <p className="max-w-xs text-sm leading-relaxed text-gray-500">
          The Annotated Expo Playground needs at least 900px of width for its
          three-column layout. Please use a larger screen or resize your browser
          window.
        </p>
      </div>

      {/* Main 3-column layout */}
      <div className="playground-grid grid h-screen grid-cols-[320px_1fr_380px]">
        {/* Left: Concept walkthrough */}
        <aside className="flex flex-col overflow-hidden border-r border-gray-200 bg-white">
          <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2.5">
            <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
              Concepts
            </span>
            {navigableConcepts.length > 0 && (
              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                {navigableConcepts.length}
              </span>
            )}
          </div>
          <ConceptList
            concepts={detectedConcepts}
            activeConceptId={activeConceptId}
            onConceptClick={handleConceptClick}
            cards={cardsMap}
          />
          <div className="flex-1 overflow-y-auto">
            <ConceptPanel
              card={activeCard}
              onPrev={handlePrev}
              onNext={handleNext}
              hasPrev={activeIndex > 0}
              hasNext={activeIndex < navigableConcepts.length - 1}
            />
          </div>
        </aside>

        {/* Center: Code editor */}
        <main className="flex flex-col overflow-hidden border-r border-gray-200">
          <div className="flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-2.5">
            <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
              Editor
            </span>
            <div className="h-3.5 w-px bg-gray-200" />
            <ExamplePicker examples={examples} onSelect={setCode} />
          </div>
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              code={code}
              onChange={setCode}
              concepts={detectedConcepts}
              activeConceptId={activeConceptId}
              onConceptClick={handleConceptClick}
            />
          </div>
        </main>

        {/* Right: Live preview */}
        <aside className="flex flex-col overflow-hidden bg-white">
          <div className="border-b border-gray-100 px-4 py-2.5">
            <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
              Preview
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <SnackPreview code={code} />
          </div>
        </aside>
      </div>
    </>
  );
}
