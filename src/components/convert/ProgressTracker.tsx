"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const stages = [
  {
    label: "Extracting PDF content",
    subtext: "Reading text, tables and structure",
    startAt: 0,
    endAt: 3000,
  },
  {
    label: "AI structuring document",
    subtext: "Gemini 1.5 Flash building document AST",
    startAt: 3000,
    endAt: 8000,
  },
  {
    label: "Rendering LaTeX",
    subtext: "Pandoc + XeLaTeX compiling output",
    startAt: 8000,
    endAt: 13000,
  },
];

export default function ProgressTracker() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed(Date.now() - start);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Indeterminate progress bar */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full w-1/3 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
          animate={{ x: ["-100%", "400%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Stages */}
      <div className="space-y-1">
        {stages.map((stage, i) => {
          const status =
            elapsed >= stage.endAt
              ? "done"
              : elapsed >= stage.startAt
                ? "active"
                : "pending";

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 ${
                status === "active"
                  ? "bg-blue-500/10 border border-blue-500/20"
                  : "bg-transparent"
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {status === "done" ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : status === "active" ? (
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                ) : (
                  <Clock className="w-5 h-5 text-slate-600" />
                )}
              </div>

              {/* Text */}
              <div>
                <p
                  className={`text-sm font-medium ${
                    status === "done"
                      ? "text-green-400"
                      : status === "active"
                        ? "text-white"
                        : "text-slate-500"
                  }`}
                >
                  {stage.label}
                </p>
                <p
                  className={`text-xs mt-0.5 ${
                    status === "active" ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {stage.subtext}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
