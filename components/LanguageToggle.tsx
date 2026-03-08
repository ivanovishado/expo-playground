"use client";

import type { Locale } from "@/lib/types";
import { SUPPORTED_LOCALES } from "@/lib/types";

interface LanguageToggleProps {
  locale: Locale;
  onChange: (locale: Locale) => void;
}

/**
 * Compact segmented control for switching the concept card language.
 * Renders a sliding pill indicator that animates between locale options.
 */
export default function LanguageToggle({
  locale,
  onChange,
}: LanguageToggleProps) {
  const activeIndex = SUPPORTED_LOCALES.findIndex((l) => l.code === locale);

  return (
    <div className="relative flex items-center rounded-md border border-gray-200 bg-gray-50/50 p-0.5">
      {/* Sliding indicator */}
      <div
        className="absolute top-0.5 bottom-0.5 rounded-[5px] bg-blue-50 border border-blue-400 shadow-sm transition-all duration-200"
        style={{
          width: `calc(${100 / SUPPORTED_LOCALES.length}% - 2px)`,
          left: `calc(${(activeIndex * 100) / SUPPORTED_LOCALES.length}% + 1px)`,
        }}
      />

      {SUPPORTED_LOCALES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => onChange(code)}
          className={`relative z-10 px-2 py-0.5 text-[10px] font-semibold transition-colors duration-150 ${
            locale === code
              ? "text-blue-700"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
