"use client";

import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw, FileText } from "lucide-react";

interface PreviewToolbarProps {
  currentPage: number;
  numPages: number | null;
  scale: number;
  onPrev: () => void;
  onNext: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  fileName?: string;
}

export default function PreviewToolbar({
  currentPage,
  numPages,
  scale,
  onPrev,
  onNext,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  fileName,
}: PreviewToolbarProps) {
  const canGoPrev = currentPage > 1;
  const canGoNext = numPages !== null && currentPage < numPages;

  return (
    <div
      className="glass-card rounded-none border-l-0 border-r-0 border-t-0 h-12 flex items-center px-4 gap-3 sticky top-0 z-20"
      style={{ borderRadius: 0 }}
    >
      {/* File name */}
      <div className="flex items-center gap-2 text-slate-400 min-w-0 flex-shrink-0 hidden sm:flex">
        <FileText className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm truncate max-w-[180px]">
          {fileName ?? "document.pdf"}
        </span>
      </div>

      <div className="w-px h-5 bg-white/[0.08] hidden sm:block flex-shrink-0" />

      {/* Page navigation */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          aria-label="Previous page"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-sm text-slate-300 tabular-nums whitespace-nowrap">
          {numPages === null ? "—" : `${currentPage} / ${numPages}`}
        </span>

        <button
          onClick={onNext}
          disabled={!canGoNext}
          aria-label="Next page"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-5 bg-white/[0.08] flex-shrink-0" />

      {/* Zoom controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onZoomOut}
          disabled={scale <= 0.5}
          aria-label="Zoom out"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          onDoubleClick={onZoomReset}
          onClick={() => {}}
          aria-label="Zoom level (double-click to reset)"
          title="Double-click to reset zoom"
          className="text-sm text-slate-300 tabular-nums w-14 text-center cursor-default select-none"
        >
          {Math.round(scale * 100)}%
        </button>

        <button
          onClick={onZoomIn}
          disabled={scale >= 2.0}
          aria-label="Zoom in"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={onZoomReset}
          aria-label="Reset zoom to 100%"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all duration-150"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
