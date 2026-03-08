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
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addDebug = useCallback((msg: string) => {
    setDebugLog((prev) => [
      ...prev.slice(-19),
      `${new Date().toISOString().slice(11, 23)} ${msg}`,
    ]);
  }, []);

  // SSR guard
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug: log ALL postMessage events from any iframe
  useEffect(() => {
    if (!mounted) return;
    addDebug(`page origin: ${window.location.origin}`);
    function onMessage(e: MessageEvent) {
      const data =
        typeof e.data === "string"
          ? e.data.slice(0, 120)
          : JSON.stringify(e.data).slice(0, 120);
      addDebug(`msg from=${e.origin} data=${data}`);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [mounted, addDebug]);

  // Initialize Snack session
  useEffect(() => {
    if (!mounted) return;

    let unsubscribe: (() => void) | undefined;

    async function initSnack() {
      addDebug("importing snack-sdk…");
      const { Snack } = await import("snack-sdk");
      addDebug("snack-sdk imported");

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
      addDebug("Snack instance created");

      snackRef.current = snack;

      unsubscribe = snack.addStateListener((state) => {
        const clients = Object.values(state.connectedClients);
        addDebug(
          `state: online=${String(state.online)} url=${state.webPreviewURL ? "yes" : "no"} clients=${String(clients.length)} transports=${Object.keys(state.transports).join(",") || "none"}`
        );

        if (state.webPreviewURL) {
          setPreviewURL(state.webPreviewURL);
        }

        const clientWithError = clients.find((c) => c.status === "error");
        if (clientWithError?.error) {
          setError(clientWithError.error);
        } else {
          setError(null);
        }
      });

      addDebug("calling setOnline(true)…");
      snack.setOnline(true);
      addDebug("setOnline(true) done");

      const initialState = snack.getState();
      addDebug(
        `initial: online=${String(initialState.online)} url=${initialState.webPreviewURL ?? "null"}`
      );
      if (initialState.webPreviewURL) {
        setPreviewURL(initialState.webPreviewURL);
      }
    }

    initSnack().catch((err: unknown) => {
      addDebug(
        `initSnack ERROR: ${err instanceof Error ? err.message : String(err)}`
      );
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
    addDebug("iframe onLoad fired");
    if (iframeRef.current?.contentWindow) {
      webPreviewRef.current = iframeRef.current.contentWindow;
      addDebug("webPreviewRef set, re-sending code…");
      snackRef.current?.updateFiles({
        "App.tsx": { type: "CODE", contents: code },
      });
    } else {
      addDebug("iframe onLoad but contentWindow is null");
    }
  }, [code, addDebug]);

  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <p className="text-xs text-gray-400">Loading preview…</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {debugLog.length > 0 && (
        <div className="max-h-40 overflow-y-auto border-b border-yellow-300 bg-yellow-50 px-3 py-2 font-mono text-[10px] leading-relaxed text-yellow-900">
          <p className="mb-1 font-bold">DEBUG</p>
          {debugLog.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}
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
