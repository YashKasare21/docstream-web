"use client";

import { ArrowRight, FileText, FileCode2, CheckCircle, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 lg:pt-36 lg:pb-24 grid lg:grid-cols-2 gap-16 items-center">
      {/* Left column — copy */}
      <div className="space-y-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          Open Source · PyPI Published · MIT License
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]"
        >
          Turn PDFs into{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            Perfect LaTeX
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg lg:text-xl text-slate-400 leading-relaxed max-w-xl"
        >
          Upload your research papers, theses, or proof-heavy documents. Our
          AI-powered pipeline extracts structure, formulas, and citations into
          publication-quality LaTeX in minutes.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap gap-4"
        >
          <a
            href="#upload"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50"
          >
            Start Converting Free
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all duration-200 border border-slate-700 hover:border-slate-600"
          >
            View on GitHub
          </a>
        </motion.div>
      </div>

      {/* Right column — animated visual */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="relative flex items-center justify-center"
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full" />

        <div className="relative w-full max-w-md aspect-square bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm overflow-hidden">
          <div className="h-full flex flex-col justify-between">
            {/* PDF card */}
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl animate-float">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-red-400" />
                <div>
                  <p className="text-sm font-medium text-white">
                    paper_draft.pdf
                  </p>
                  <p className="text-xs text-slate-500">2.4 MB</p>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>

            {/* Arrow animation */}
            <div className="flex justify-center my-4">
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-[1px] bg-gradient-to-b from-blue-500 to-transparent" />
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Zap className="w-6 h-6 text-blue-400" />
                </motion.div>
                <div className="h-12 w-[1px] bg-gradient-to-t from-indigo-500 to-transparent" />
              </div>
            </div>

            {/* LaTeX output card */}
            <div className="p-4 bg-slate-800/50 rounded-xl border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileCode2 className="w-8 h-8 text-blue-400" />
                  <p className="text-sm font-medium text-white">main.tex</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase font-medium">
                  Ready
                </span>
              </div>
              <div className="space-y-1.5 opacity-70 font-mono text-[11px]">
                <div className="text-slate-400">
                  <span className="text-blue-400">\documentclass</span>
                  {"{article}"}
                </div>
                <div className="text-slate-400">
                  <span className="text-blue-400">\usepackage</span>
                  {"{amsmath}"}
                </div>
                <div className="text-slate-400">
                  <span className="text-blue-400">\begin</span>
                  {"{document}"}
                </div>
                <div className="text-slate-300 pl-4">{"$E = mc^2$"}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
