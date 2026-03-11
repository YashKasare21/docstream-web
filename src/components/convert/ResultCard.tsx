"use client";

import { CheckCircle, FileCode, FileDown, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface ResultCardProps {
  texUrl: string;
  pdfUrl: string;
  processingTime: number;
  onReset: () => void;
}

export default function ResultCard({
  texUrl,
  pdfUrl,
  processingTime,
  onReset,
}: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-2xl border border-green-500/20 bg-slate-900/60 p-8 text-center"
    >
      {/* Success header */}
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-white">Conversion Complete</h3>
        <p className="text-sm text-slate-400">
          Converted in {processingTime.toFixed(1)}s
        </p>
      </div>

      {/* Download buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <a
          href={texUrl}
          download
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-700 hover:border-slate-600 text-white font-medium transition-all duration-200 hover:bg-slate-800"
        >
          <FileCode className="w-4 h-4 text-blue-400" />
          Download .tex
        </a>
        <a
          href={pdfUrl}
          download
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all duration-200 shadow-lg shadow-blue-900/20"
        >
          <FileDown className="w-4 h-4" />
          Download .pdf
        </a>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-800 my-6" />

      {/* Reset */}
      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors duration-200"
      >
        <RotateCcw className="w-4 h-4" />
        Convert Another PDF
      </button>
    </motion.div>
  );
}
