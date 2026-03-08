"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  Group,
  Panel,
  Separator,
  usePanelRef,
  useGroupRef,
} from "react-resizable-panels";
import type { ConceptCard, DetectedConcept, Locale } from "@/lib/types";
import { DEFAULT_LOCALE } from "@/lib/types";
import { analyzeCode } from "@/lib/analyzer";
import examples from "@/content/examples";
import CodeEditor from "./CodeEditor";
import ConceptPanel from "./ConceptPanel";
import ConceptList from "./ConceptList";
import SnackPreview from "./SnackPreview";
import ExamplePicker from "./ExamplePicker";
import LanguageToggle from "./LanguageToggle";

const LAYOUT_STORAGE_KEY = "playground-layout";
const PREVIEW_COLLAPSED_SIZE = 36;

function PanelHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2.5">
      <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
        {title}
      </span>
      {children}
    </div>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  const d = direction === "left" ? "M10 4L6 8l4 4" : "M6 4l4 4-4 4";
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

interface PlaygroundShellProps {
  conceptCardsByLocale: Record<Locale, ConceptCard[]>;
}

export default function PlaygroundShell({
  conceptCardsByLocale,
}: PlaygroundShellProps) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  const cardsMap = useMemo(() => {
    const map = new Map<string, ConceptCard>();
    const cards = conceptCardsByLocale[locale] ?? [];
    for (const card of cards) {
      map.set(card.id, card);
    }
    return map;
  }, [conceptCardsByLocale, locale]);

  const initialCode = examples[0]?.code ?? "";

  const [code, setCode] = useState(initialCode);
  const [detectedConcepts, setDetectedConcepts] = useState<DetectedConcept[]>(
    () => analyzeCode(initialCode)
  );
  const [activeConceptId, setActiveConceptId] = useState<string | null>(null);

  // Resizable panels
  const groupRef = useGroupRef();
  const previewPanelRef = usePanelRef();
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);

  // Restore saved layout after hydration (avoids SSR mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (saved && groupRef.current) {
        groupRef.current.setLayout(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }
  }, [groupRef]);

  const handleLayoutChanged = useCallback((layout: Record<string, number>) => {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handlePreviewResize = useCallback(() => {
    setIsPreviewCollapsed(previewPanelRef.current?.isCollapsed() ?? false);
  }, [previewPanelRef]);

  const togglePreview = useCallback(() => {
    if (previewPanelRef.current?.isCollapsed()) {
      previewPanelRef.current.expand();
    } else {
      previewPanelRef.current?.collapse();
    }
  }, [previewPanelRef]);

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
      <Group
        orientation="horizontal"
        className="playground-grid"
        style={{ height: "100vh" }}
        groupRef={groupRef}
        onLayoutChanged={handleLayoutChanged}
      >
        {/* Left: Concept walkthrough */}
        <Panel
          id="concepts"
          className="relative"
          defaultSize="25%"
          minSize={200}
        >
          <aside className="absolute inset-0 flex flex-col overflow-hidden bg-white">
            <PanelHeader title="Concepts">
              {navigableConcepts.length > 0 && (
                <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                  {navigableConcepts.length}
                </span>
              )}
              <div className="ml-auto">
                <LanguageToggle locale={locale} onChange={setLocale} />
              </div>
            </PanelHeader>
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
        </Panel>

        <Separator className="panel-resize-handle" />

        {/* Center: Code editor */}
        <Panel id="editor" className="relative" defaultSize="45%" minSize={300}>
          <main className="absolute inset-0 flex flex-col overflow-hidden">
            <PanelHeader title="Editor">
              <div className="h-3.5 w-px bg-gray-200" />
              <ExamplePicker examples={examples} onSelect={setCode} />
            </PanelHeader>
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
        </Panel>

        <Separator className="panel-resize-handle" />

        {/* Right: Live preview */}
        <Panel
          id="preview"
          className="relative"
          panelRef={previewPanelRef}
          defaultSize="30%"
          minSize={200}
          collapsible
          collapsedSize={PREVIEW_COLLAPSED_SIZE}
          onResize={handlePreviewResize}
        >
          {isPreviewCollapsed && (
            <div className="absolute inset-0 flex items-center justify-center border-l border-gray-200 bg-white">
              <button
                onClick={togglePreview}
                className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                title="Expand preview"
              >
                <ChevronIcon direction="left" />
              </button>
            </div>
          )}
          <aside
            className={`absolute inset-0 flex flex-col overflow-hidden bg-white ${isPreviewCollapsed ? "hidden" : ""}`}
          >
            <PanelHeader title="Preview">
              <button
                onClick={togglePreview}
                className="ml-auto rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                title="Collapse preview"
              >
                <ChevronIcon direction="right" />
              </button>
            </PanelHeader>
            <div className="flex-1 overflow-hidden">
              <SnackPreview code={code} locale={locale} />
            </div>
          </aside>
        </Panel>
      </Group>
    </>
  );
}
