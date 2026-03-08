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
                ? "border-blue-400 bg-blue-50 text-blue-700 shadow-sm"
                : "border-gray-200 bg-gray-50/50 text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
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
