"use client";

import { CheckCircle, FileCode, FileDown, RotateCcw, Zap } from "lucide-react";
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
      className="glass-card p-8 text-center"
      style={{ borderTop: "2px solid rgba(34, 197, 94, 0.6)" }}
    >
      {/* Success icon */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]"
      >
        <CheckCircle className="w-10 h-10 text-green-400" />
      </motion.div>

      <h3 className="text-xl font-bold text-white mb-2">Conversion Complete</h3>
      <p className="text-sm text-slate-400 flex items-center justify-center gap-1.5 mb-8">
        <Zap className="w-3.5 h-3.5 text-yellow-400" />
        Converted in {processingTime.toFixed(1)}s
      </p>

      {/* Download buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <a
          href={texUrl}
          download
          className="flex-1 glass-card border border-white/10 hover:border-blue-500/40 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:text-blue-300 transition-all duration-200"
        >
          <FileCode className="w-4 h-4 text-blue-400" />
          Download .tex
        </a>
        <a
          href={pdfUrl}
          download
          className="flex-1 shimmer-btn bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-200"
        >
          <FileDown className="w-4 h-4" />
          Download .pdf
        </a>
      </div>

      {/* Divider */}
      <div className="border-t border-white/[0.06] my-6" />

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
