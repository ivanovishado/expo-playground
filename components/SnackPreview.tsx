"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { SnackError } from "snack-sdk";

interface SnackPreviewProps {
  code: string;
}

/**
 * Renders a live Expo Snack preview in an iframe.
 * Creates a Snack SDK session on mount, updates code via the SDK's
 * built-in debounce, and displays errors from the connected preview.
 */
export default function SnackPreview({ code }: SnackPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const snackRef = useRef<InstanceType<
    typeof import("snack-sdk").Snack
  > | null>(null);
  const webPreviewRef = useRef<Window | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [error, setError] = useState<SnackError | null>(null);
  const [mounted, setMounted] = useState(false);

  // SSR guard
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize Snack session
  useEffect(() => {
    if (!mounted) return;

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

        // Check connected clients for errors
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

    initSnack();

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
