"use client";

import { useState } from "react";
import { Download, CheckCircle, RefreshCw } from "lucide-react";

interface DownloadPanelProps {
  texUrl: string;
  pdfUrl: string;
  processingTime?: number;
  onConvertAnother: () => void;
  jobId: string;
}

const EMOJIS = ["😞", "😐", "😊", "😄", "🤩"] as const;

export default function DownloadPanel({
  texUrl,
  pdfUrl,
  processingTime,
  onConvertAnother,
  jobId,
}: DownloadPanelProps) {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!selectedEmoji || submitting) return;
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("job_id", jobId);
      formData.append("emoji_rating", selectedEmoji);
      formData.append("comment", comment.slice(0, 500));
      await fetch("/api/v2/feedback", { method: "POST", body: formData });
    } catch {
      // fire and forget — never surface errors to the user
    } finally {
      setSubmitted(true);
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Status */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-1">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <span className="font-semibold text-white">Ready</span>
          </div>
          {processingTime !== undefined && processingTime > 0 && (
            <p className="text-sm text-slate-400 pl-8">
              Converted in {processingTime.toFixed(1)}s
            </p>
          )}
        </div>

        {/* Download buttons */}
        <div className="space-y-3">
          <a
            href={texUrl}
            download="document.tex"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.15] text-slate-200 hover:text-white font-medium text-sm transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            Download .tex
          </a>
          <a
            href={pdfUrl}
            download="document.pdf"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-blue-900/30"
          >
            <Download className="w-4 h-4" />
            Download .pdf
          </a>
        </div>

        <div className="w-full h-px bg-white/[0.06]" />

        {/* Feedback */}
        <div>
          <p className="text-sm font-medium text-slate-300 mb-3">
            How was this?
          </p>

          {submitted ? (
            <div className="text-center py-3">
              <p className="text-sm text-green-400 font-medium">
                Thanks for your feedback! 🙏
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Emoji row */}
              <div className="flex items-center justify-between gap-1">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`text-2xl w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      selectedEmoji === emoji
                        ? "ring-2 ring-blue-500 bg-blue-500/20 scale-110"
                        : "hover:bg-white/[0.08] hover:scale-105"
                    }`}
                    aria-label={`Rate: ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Comment input */}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What could be better? (optional)"
                rows={2}
                maxLength={500}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] focus:border-blue-500/50 focus:outline-none text-sm text-slate-200 placeholder-slate-500 resize-none transition-colors duration-200"
              />

              {/* Submit button */}
              <button
                onClick={handleSubmitFeedback}
                disabled={!selectedEmoji || submitting}
                className="w-full py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-sm text-slate-300 hover:text-white font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? "Sending…" : "Submit feedback"}
              </button>
            </div>
          )}
        </div>

        <div className="w-full h-px bg-white/[0.06]" />

        {/* Convert another */}
        <button
          onClick={onConvertAnother}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-white/[0.08] hover:border-white/[0.15] text-slate-400 hover:text-white text-sm font-medium transition-all duration-200 hover:bg-white/[0.04]"
        >
          <RefreshCw className="w-4 h-4" />
          Convert another
        </button>
      </div>
    </div>
  );
}
