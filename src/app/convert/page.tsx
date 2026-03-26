"use client";

import { useReducer, useState, useCallback } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import DropZone from "@/components/convert/DropZone";
import TemplateSelector from "@/components/convert/TemplateSelector";
import ProgressTracker from "@/components/convert/ProgressTracker";
import ResultCard from "@/components/convert/ResultCard";
import ErrorCard from "@/components/convert/ErrorCard";
import { convertPDF, type ConvertResult } from "@/lib/api";

// ── State machine ──
type State =
  | { status: "idle" }
  | { status: "file_selected"; file: File }
  | { status: "processing"; file: File; template: string }
  | { status: "complete"; result: ConvertResult }
  | { status: "error"; message: string };

type Action =
  | { type: "SELECT_FILE"; file: File }
  | { type: "REMOVE_FILE" }
  | { type: "START_PROCESSING"; template: string }
  | { type: "COMPLETE"; result: ConvertResult }
  | { type: "FAIL"; message: string }
  | { type: "RESET" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SELECT_FILE":
      return { status: "file_selected", file: action.file };
    case "REMOVE_FILE":
      return { status: "idle" };
    case "START_PROCESSING":
      if (state.status !== "file_selected") return state;
      return {
        status: "processing",
        file: state.file,
        template: action.template,
      };
    case "COMPLETE":
      return { status: "complete", result: action.result };
    case "FAIL":
      return { status: "error", message: action.message };
    case "RESET":
      return { status: "idle" };
    default:
      return state;
  }
}

export default function ConvertPage() {
  const [state, dispatch] = useReducer(reducer, { status: "idle" });
  const [template, setTemplate] = useState("report");

  const handleConvert = useCallback(async () => {
    if (state.status !== "file_selected") return;

    dispatch({ type: "START_PROCESSING", template });

    try {
      const result = await convertPDF(state.file, template);
      dispatch({ type: "COMPLETE", result });
    } catch (err) {
      dispatch({
        type: "FAIL",
        message:
          err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    }
  }, [state, template]);

  const isInputVisible =
    state.status === "idle" || state.status === "file_selected";

  return (
    <div className="min-h-screen relative text-slate-200">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 60%)`
        }}
        aria-hidden="true"
      />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Heading */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Convert your PDF
          </h1>
          <p className="text-slate-400">
            Upload a PDF and select a template. We handle the rest.
          </p>
        </div>

        {/* ── Content per state ── */}
        <div className="space-y-8 bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-8">
          {/* Idle / File Selected */}
          {isInputVisible && (
            <>
              <DropZone
                file={state.status === "file_selected" ? state.file : null}
                onFileSelect={(file) =>
                  dispatch({ type: "SELECT_FILE", file })
                }
                onFileRemove={() => dispatch({ type: "REMOVE_FILE" })}
              />
              <TemplateSelector selected={template} onSelect={setTemplate} />

              {/* Convert button */}
              {state.status === "file_selected" && (
                <button
                  onClick={handleConvert}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base transition-all duration-200 shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40"
                >
                  Convert to LaTeX
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </>
          )}

          {/* Processing */}
          {state.status === "processing" && <ProgressTracker />}

          {/* Complete */}
          {state.status === "complete" && (
            <ResultCard
              texUrl={state.result.tex_url}
              pdfUrl={state.result.pdf_url}
              processingTime={state.result.processing_time}
              onReset={() => dispatch({ type: "RESET" })}
            />
          )}

          {/* Error */}
          {state.status === "error" && (
            <ErrorCard
              message={state.message}
              onRetry={() => dispatch({ type: "RESET" })}
            />
          )}
        </div>
      </div>
    </div>
  );
}
