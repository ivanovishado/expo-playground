"use client";

import { useMemo, useEffect, useRef, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { StateField, StateEffect } from "@codemirror/state";
import {
  EditorView,
  Decoration,
  type DecorationSet,
  placeholder,
} from "@codemirror/view";
import type { DetectedConcept } from "@/lib/types";
import { buildDecorations } from "@/lib/codemirror-decorations";

/**
 * StateEffect used to push new decoration sets into the editor
 * without rebuilding the entire extension array.
 */
const setDecorationsEffect = StateEffect.define<DecorationSet>();

/**
 * StateField that holds the current concept decorations.
 * Updates when a setDecorationsEffect is dispatched, and maps
 * existing decorations through document changes to keep positions
 * correct between analysis cycles.
 */
const decorationField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(value, tr) {
    for (const e of tr.effects) {
      if (e.is(setDecorationsEffect)) return e.value;
    }
    return value.map(tr.changes);
  },
  provide: (f) => EditorView.decorations.from(f),
});

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  concepts: DetectedConcept[];
  activeConceptId: string | null;
  onConceptClick: (conceptId: string) => void;
}

export default function CodeEditor({
  code,
  onChange,
  concepts,
  activeConceptId,
  onConceptClick,
}: CodeEditorProps) {
  const viewRef = useRef<EditorView | null>(null);

  const handleCreateEditor = useCallback((view: EditorView) => {
    viewRef.current = view;
  }, []);

  /**
   * Stable extensions — only rebuilt when onConceptClick changes
   * (which is typically stable via useCallback in the parent).
   * The javascript() language, click handler, and decoration field
   * do not need to change when concepts/activeConceptId change.
   */
  const extensions = useMemo(() => {
    const clickHandler = EditorView.domEventHandlers({
      click(event: MouseEvent) {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return false;

        const conceptEl = target.closest<HTMLElement>("[data-concept-id]");
        if (!conceptEl) return false;

        const conceptId = conceptEl.getAttribute("data-concept-id");
        if (conceptId) {
          onConceptClick(conceptId);
          return true;
        }
        return false;
      },
    });

    return [
      javascript({ jsx: true, typescript: true }),
      clickHandler,
      decorationField,
      placeholder("Paste some Expo code or pick an example above."),
    ];
  }, [onConceptClick]);

  /**
   * Dispatch decoration updates via StateEffect whenever concepts
   * or the active concept changes. This avoids rebuilding the
   * entire extensions array (which would reset the javascript()
   * language and click handler).
   */
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const decos = buildDecorations(concepts, activeConceptId, view.state.doc);
    view.dispatch({ effects: setDecorationsEffect.of(decos) });
  }, [concepts, activeConceptId]);

  return (
    <CodeMirror
      value={code}
      onChange={onChange}
      extensions={extensions}
      onCreateEditor={handleCreateEditor}
      height="100%"
      basicSetup={{
        lineNumbers: true,
        highlightActiveLine: true,
        bracketMatching: true,
        foldGutter: true,
      }}
      className="h-full overflow-auto"
    />
  );
}
