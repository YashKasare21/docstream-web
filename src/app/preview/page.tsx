"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import PreviewToolbar from "@/components/preview/PreviewToolbar";
import DownloadPanel from "@/components/preview/DownloadPanel";

// Lazy-load PDFPreview client-only — avoids SSR issues with PDF.js canvas APIs
const PDFPreview = dynamic(
  () => import("@/components/preview/PDFPreview"),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm">Loading viewer…</span>
        </div>
      </div>
    ),
  }
);

// ── Inner component (needs useSearchParams → must be wrapped in Suspense) ──

function PreviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pdfUrl = searchParams.get("pdf_url") ?? "";
  const texUrl = searchParams.get("tex_url") ?? "";
  const jobId = searchParams.get("job_id") ?? "unknown";
  const processingTime = parseFloat(searchParams.get("time") ?? "0");
  const templateUsed = searchParams.get("template") ?? undefined;
  const documentType = searchParams.get("doc_type") ?? undefined;

  // Shared viewer state (toolbar + viewer are siblings)
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1.0);

  const goToPrev = useCallback(
    () => setCurrentPage((p) => Math.max(1, p - 1)),
    []
  );
  const goToNext = useCallback(
    () => setCurrentPage((p) => Math.min(numPages ?? 1, p + 1)),
    [numPages]
  );
  const zoomIn = useCallback(
    () => setScale((s) => Math.min(2.0, +(s + 0.1).toFixed(1))),
    []
  );
  const zoomOut = useCallback(
    () => setScale((s) => Math.max(0.5, +(s - 0.1).toFixed(1))),
    []
  );
  const zoomReset = useCallback(() => setScale(1.0), []);

  // Keyboard shortcuts (since PDFPreview is controlled, we handle keys here)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === "+" || e.key === "=") {
        zoomIn();
      } else if (e.key === "-") {
        zoomOut();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goToNext, goToPrev, zoomIn, zoomOut]);

  // Missing PDF param
  if (!pdfUrl) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
        <div className="glass-card p-8 max-w-sm w-full text-center">
          <p className="text-slate-300 font-medium mb-2">No PDF to preview</p>
          <p className="text-slate-500 text-sm mb-6">
            Return to the convert page and try again.
          </p>
          <Link
            href="/convert"
            className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 underline transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Convert
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="mesh-bg" aria-hidden="true" />

      {/* ── Header ── */}
      <header className="glass-card rounded-none border-x-0 border-t-0 h-14 flex items-center px-4 gap-4 flex-shrink-0 z-30 sticky top-0">
        <Link
          href="/convert"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Convert</span>
        </Link>

        <div className="flex-1 flex justify-center">
          <span className="text-sm font-semibold text-white tracking-wide">
            Docstream Preview
          </span>
        </div>

        {jobId !== "unknown" && (
          <span className="text-[11px] font-mono text-slate-500 bg-white/[0.04] border border-white/[0.06] rounded-md px-2 py-1">
            {jobId.slice(0, 8)}
          </span>
        )}
      </header>

      {/* ── Toolbar (full-width, sticky below header) ── */}
      <PreviewToolbar
        currentPage={currentPage}
        numPages={numPages}
        scale={scale}
        onPrev={goToPrev}
        onNext={goToNext}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onZoomReset={zoomReset}
        fileName={`job-${jobId.slice(0, 8)}.pdf`}
      />

      {/* ── Main layout ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* PDF viewer — 70% on desktop */}
        <div className="flex-1 lg:max-w-[70%] overflow-hidden flex flex-col">
          <PDFPreview
            pdfUrl={pdfUrl}
            page={currentPage}
            scale={scale}
            onNumPages={setNumPages}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Download panel — 30% on desktop, full-width below on mobile */}
        <aside className="hidden lg:flex lg:w-[30%] border-l border-white/[0.06] bg-slate-900/40 overflow-y-auto">
          <DownloadPanel
            texUrl={texUrl}
            pdfUrl={pdfUrl}
            processingTime={processingTime}
            jobId={jobId}
            templateUsed={templateUsed}
            documentType={documentType}
            onConvertAnother={() => router.push("/convert")}
          />
        </aside>
      </div>

      {/* Mobile download panel — rendered below PDF viewer */}
      <div className="lg:hidden border-t border-white/[0.06]">
        <DownloadPanel
          texUrl={texUrl}
          pdfUrl={pdfUrl}
          processingTime={processingTime}
          jobId={jobId}
          onConvertAnother={() => router.push("/convert")}
        />
      </div>
    </div>
  );
}

// ── Page (wraps in Suspense for useSearchParams) ──

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      }
    >
      <PreviewContent />
    </Suspense>
  );
}
