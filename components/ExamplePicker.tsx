"use client";

import { useState } from "react";
import type { ExampleApp } from "@/lib/types";

interface ExamplePickerProps {
  examples: ExampleApp[];
  onSelect: (code: string) => void;
}

/**
 * Renders a row of buttons for pre-loaded example apps.
 * Selecting an example injects its code into the editor.
 * Initializes with the first example active since PlaygroundShell
 * loads examples[0] as the default code.
 */
export default function ExamplePicker({
  examples,
  onSelect,
}: ExamplePickerProps) {
  const [activeId, setActiveId] = useState<string | null>(
    examples[0]?.id ?? null
  );

  function handleSelect(example: ExampleApp) {
    setActiveId(example.id);
    onSelect(example.code);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {examples.map((example) => {
        const isActive = activeId === example.id;
        return (
          <button
            key={example.id}
            type="button"
            onClick={() => handleSelect(example)}
            className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all duration-150 ${
              isActive
                ? "border-accent-border bg-accent-subtle text-accent-text shadow-sm"
                : "border-border bg-surface-raised/50 text-text-tertiary hover:bg-surface-raised hover:text-text-secondary"
            }`}
            title={example.description}
          >
            {example.name}
          </button>
        );
      })}
    </div>
  );
}
