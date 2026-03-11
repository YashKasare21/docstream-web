"use client";

import { useRef, useState, useCallback } from "react";
import { CloudUpload, FileText, CheckCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type DropZoneState = "idle" | "dragging" | "selected" | "uploading";

interface DropZoneProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  state?: DropZoneState;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function DropZone({
  file,
  onFileSelect,
  onFileRemove,
  state: externalState,
}: DropZoneProps) {
  const [internalDragging, setInternalDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentState: DropZoneState =
    externalState === "uploading"
      ? "uploading"
      : internalDragging
        ? "dragging"
        : file
          ? "selected"
          : "idle";

  const validateFile = useCallback(
    (f: File): boolean => {
      if (f.type !== "application/pdf") {
        alert("Only PDF files are accepted.");
        return false;
      }
      if (f.size > 10 * 1024 * 1024) {
        alert("File size must be under 10 MB.");
        return false;
      }
      onFileSelect(f);
      return true;
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setInternalDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) validateFile(droppedFile);
    },
    [validateFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) validateFile(selected);
    },
    [validateFile]
  );

  const borderClass =
    currentState === "dragging"
      ? "border-blue-500 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.15)]"
      : currentState === "selected"
        ? "border-green-500/30 bg-slate-900/60"
        : "border-slate-700 hover:border-blue-500/40 hover:bg-slate-900/60";

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setInternalDragging(true);
      }}
      onDragLeave={() => setInternalDragging(false)}
      onDrop={handleDrop}
      onClick={() => currentState === "idle" && inputRef.current?.click()}
      className={`relative rounded-2xl border-2 border-dashed p-10 transition-all duration-300 cursor-pointer ${borderClass}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={handleChange}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {/* ── Idle / Dragging ── */}
        {(currentState === "idle" || currentState === "dragging") && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center gap-4"
          >
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                currentState === "dragging"
                  ? "bg-blue-500/20 scale-110"
                  : "bg-blue-500/10"
              }`}
            >
              <CloudUpload
                className={`w-8 h-8 transition-colors ${
                  currentState === "dragging"
                    ? "text-blue-400"
                    : "text-blue-500"
                }`}
              />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">
                {currentState === "dragging"
                  ? "Release to upload"
                  : "Drop your PDF here"}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                or click to browse · Max 10MB
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Selected ── */}
        {currentState === "selected" && file && (
          <motion.div
            key="selected"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{file.name}</p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileRemove();
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Uploading ── */}
        {currentState === "uploading" && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-300">Uploading...</p>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
