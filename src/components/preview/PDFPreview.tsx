"use client";

import { useState, useEffect, useCallback } from "react";
import { Document, Page } from "react-pdf";
import { AlertCircle, Loader2 } from "lucide-react";
import "@/lib/pdf-worker";

interface PDFPreviewProps {
  pdfUrl: string;
  /** Controlled current page — if provided, component is controlled */
  page?: number;
  /** Controlled scale */
  scale?: number;
  /** Called when the document loads and we know the total page count */
  onNumPages?: (n: number) => void;
  /** Called when user clicks a thumbnail to jump to a page */
  onPageChange?: (page: number) => void;
  onLoadSuccess?: () => void;
  onLoadError?: (error: Error) => void;
}

export default function PDFPreview({
  pdfUrl,
  page: controlledPage,
  scale: controlledScale,
  onNumPages,
  onPageChange,
  onLoadSuccess,
  onLoadError,
}: PDFPreviewProps) {
  // Internal state (used when uncontrolled)
  const [internalPage, setInternalPage] = useState(1);
  const [internalScale, setInternalScale] = useState(1.0);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPage = controlledPage ?? internalPage;
  const scale = controlledScale ?? internalScale;

  const goToPage = useCallback(
    (p: number) => {
      const clamped = Math.max(1, Math.min(numPages ?? 1, p));
      if (controlledPage === undefined) setInternalPage(clamped);
      onPageChange?.(clamped);
    },
    [numPages, controlledPage, onPageChange]
  );

  // Keyboard navigation (when component is uncontrolled)
  useEffect(() => {
    if (controlledPage !== undefined) return; // parent handles keyboard
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goToPage(internalPage + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goToPage(internalPage - 1);
      } else if (e.key === "+" || e.key === "=") {
        setInternalScale((s) => Math.min(2.0, +(s + 0.1).toFixed(1)));
      } else if (e.key === "-") {
        setInternalScale((s) => Math.max(0.5, +(s - 0.1).toFixed(1)));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [internalPage, goToPage, controlledPage]);

  const handleLoadSuccess = useCallback(
    ({ numPages: n }: { numPages: number }) => {
      setNumPages(n);
      setIsLoading(false);
      onNumPages?.(n);
      onLoadSuccess?.();
    },
    [onNumPages, onLoadSuccess]
  );

  const handleLoadError = useCallback(
    (err: Error) => {
      setError(err.message);
      setIsLoading(false);
      onLoadError?.(err);
    },
    [onLoadError]
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 p-8">
        <div className="glass-card p-6 max-w-sm w-full text-center border-red-500/20">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-red-300 mb-1">
            Could not load PDF
          </p>
          <p className="text-xs text-slate-500 mb-4 break-words">{error}</p>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 underline transition-colors"
          >
            Try downloading directly
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0">
      {/* ── Thumbnail sidebar (hidden on mobile) ── */}
      {!isLoading && numPages !== null && (
        <aside className="hidden lg:flex flex-col w-20 bg-slate-900/60 border-r border-white/[0.06] overflow-y-auto py-3 gap-2 items-center flex-shrink-0">
          {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`relative flex-shrink-0 transition-all duration-150 rounded ${
                p === currentPage
                  ? "ring-2 ring-blue-500 ring-offset-1 ring-offset-slate-900"
                  : "hover:ring-1 hover:ring-white/20 ring-offset-1 ring-offset-slate-900"
              }`}
              aria-label={`Go to page ${p}`}
              title={`Page ${p}`}
            >
              <Document file={pdfUrl} loading={null}>
                <Page
                  pageNumber={p}
                  width={60}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
              <span className="absolute bottom-0.5 right-0.5 text-[9px] text-white bg-black/60 rounded px-0.5 leading-tight">
                {p}
              </span>
            </button>
          ))}
        </aside>
      )}

      {/* ── Main PDF viewer ── */}
      <div className="flex-1 bg-slate-950 overflow-auto flex flex-col items-center py-8 px-4">
        {/* Loading skeleton */}
        {isLoading && (
          <div className="flex flex-col items-center gap-4">
            <div
              className="rounded bg-slate-800 animate-pulse"
              style={{ width: 595 * scale, height: 842 * scale, maxWidth: "100%" }}
            />
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading preview…
            </div>
          </div>
        )}

        <Document
          file={pdfUrl}
          onLoadSuccess={handleLoadSuccess}
          onLoadError={handleLoadError}
          loading={null}
        >
          <Page
            pageNumber={currentPage}
            scale={scale}
            renderTextLayer
            renderAnnotationLayer
            className="shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
            loading={null}
          />
        </Document>
      </div>
    </div>
  );
}
