"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { SnackError } from "snack-sdk";
import type { Locale } from "@/lib/types";

const FALLBACK_TEXT: Record<
  Locale,
  {
    heading: string;
    description: string;
    openInSnack: string;
    or: string;
    localInstructions: string;
  }
> = {
  en: {
    heading: "Preview available on Snack",
    description:
      "Live preview requires a local development server. You can open your code directly in Expo Snack instead.",
    openInSnack: "Open in Snack",
    or: "or",
    localInstructions: "For live preview, clone the repo and run locally:",
  },
  es: {
    heading: "Vista previa disponible en Snack",
    description:
      "La vista previa en vivo requiere un servidor de desarrollo local. Puedes abrir tu código directamente en Expo Snack.",
    openInSnack: "Abrir en Snack",
    or: "o",
    localInstructions:
      "Para vista previa en vivo, clona el repo y ejecútalo localmente:",
  },
};

interface SnackPreviewProps {
  code: string;
  locale?: Locale;
}

/**
 * Build a Snack URL that opens the current code in snack.expo.dev.
 * Uses `files` param so the file is named App.tsx (not a raw `code` blob).
 */
function buildSnackUrl(code: string): string {
  const params = new URLSearchParams({
    name: "Expo Playground",
    platform: "web",
    files: JSON.stringify({ "App.tsx": { type: "CODE", contents: code } }),
  });
  return `https://snack.expo.dev/?${params.toString()}`;
}

function DeployedPreviewFallback({
  code,
  locale = "en",
}: {
  code: string;
  locale?: Locale;
}) {
  const t = FALLBACK_TEXT[locale];

  return (
    <div className="flex h-full flex-col items-center justify-center bg-gray-50 px-6 py-8">
      <div className="w-full max-w-xs text-center">
        {/* Snack icon */}
        <svg
          className="mx-auto mb-4 h-10 w-10 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
          />
        </svg>

        <h3 className="mb-2 text-sm font-semibold text-gray-800">
          {t.heading}
        </h3>

        <p className="mb-5 text-xs leading-relaxed text-gray-500">
          {t.description}
        </p>

        <a
          href={buildSnackUrl(code)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-600"
        >
          {/* External link icon */}
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
          {t.openInSnack}
        </a>

        {/* Separator */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
            {t.or}
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <p className="mb-3 text-xs text-gray-500">{t.localInstructions}</p>

        <a
          href="https://github.com/ivanovishado/expo-playground"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-500 transition-colors hover:text-blue-600"
        >
          {/* GitHub icon */}
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          ivanovishado/expo-playground
        </a>
      </div>
    </div>
  );
}

/**
 * Renders a live Expo Snack preview in an iframe.
 * Creates a Snack SDK session on mount, updates code via the SDK's
 * built-in debounce, and displays errors from the connected preview.
 *
 * On deployed sites (non-localhost), shows a fallback UI with a
 * link to open the code in Expo Snack, since the Snack runtime
 * only allows localhost origins for postMessage communication.
 */
export default function SnackPreview({
  code,
  locale = "en",
}: SnackPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const snackRef = useRef<InstanceType<
    typeof import("snack-sdk").Snack
  > | null>(null);
  const webPreviewRef = useRef<Window | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [error, setError] = useState<SnackError | null>(null);
  const [mounted, setMounted] = useState(false);

  const isLocalhost = mounted && window.location.hostname === "localhost";

  // SSR guard
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize Snack session (localhost only)
  useEffect(() => {
    if (!mounted) return;
    if (window.location.hostname !== "localhost") return;

    let unsubscribe: (() => void) | undefined;

    async function initSnack() {
      const { Snack } = await import("snack-sdk");

      const snack = new Snack({
        name: "Expo Playground",
        description: "Live preview from the Annotated Expo Playground",
        files: {
          "App.tsx": { type: "CODE", contents: code },
        },
        dependencies: {
          "react-native-paper": { version: "~5.12.0" },
        },
        sdkVersion: "52.0.0",
        webPreviewRef: webPreviewRef as { current: Window | null },
        codeChangesDelay: 1000,
      });

      snackRef.current = snack;

      unsubscribe = snack.addStateListener((state) => {
        if (state.webPreviewURL) {
          setPreviewURL(state.webPreviewURL);
        }

        const clients = Object.values(state.connectedClients);
        const clientWithError = clients.find((c) => c.status === "error");
        if (clientWithError?.error) {
          setError(clientWithError.error);
        } else {
          setError(null);
        }
      });

      snack.setOnline(true);

      const initialState = snack.getState();
      if (initialState.webPreviewURL) {
        setPreviewURL(initialState.webPreviewURL);
      }
    }

    initSnack().catch(() => {
      // Snack initialization failed silently — preview will show loading state
    });

    return () => {
      unsubscribe?.();
      if (snackRef.current) {
        snackRef.current.setOnline(false);
        snackRef.current = null;
      }
    };
    // Only run on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Update Snack files when code changes (SDK handles debouncing via codeChangesDelay)
  useEffect(() => {
    if (!snackRef.current) return;
    snackRef.current.updateFiles({
      "App.tsx": { type: "CODE", contents: code },
    });
  }, [code]);

  // Wire iframe contentWindow to webPreviewRef and re-deliver code.
  // The SDK's initial sendAsync fires before the iframe renders, so
  // webPreviewRef.current is still null and the message is lost.
  // Re-sending here ensures the iframe receives the code once it's ready.
  const handleIframeLoad = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      webPreviewRef.current = iframeRef.current.contentWindow;
      snackRef.current?.updateFiles({
        "App.tsx": { type: "CODE", contents: code },
      });
    }
  }, [code]);

  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <p className="text-xs text-gray-400">Loading preview…</p>
      </div>
    );
  }

  if (!isLocalhost) {
    return <DeployedPreviewFallback code={code} locale={locale} />;
  }

  return (
    <div className="flex h-full flex-col">
      {error && (
        <div className="border-b border-red-200 bg-red-50 px-3 py-2.5 transition-all duration-200">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 text-xs text-red-400">●</span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-red-700">
                {error.message}
              </p>
              {error.lineNumber != null && (
                <p className="mt-0.5 text-[11px] text-red-500">
                  Line {error.lineNumber}
                  {error.columnNumber != null
                    ? `, Col ${error.columnNumber}`
                    : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      {previewURL ? (
        <iframe
          ref={iframeRef}
          src={previewURL}
          onLoad={handleIframeLoad}
          className="flex-1 border-0 bg-white"
          title="Expo Snack Preview"
          allow="accelerometer; gyroscope; screen-wake-lock"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        />
      ) : (
        <div className="flex flex-1 items-center justify-center bg-gray-50/50">
          <div className="text-center">
            <div className="mx-auto mb-3 h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
            <p className="text-xs text-gray-400">Connecting to Expo…</p>
          </div>
        </div>
      )}
    </div>
  );
}
