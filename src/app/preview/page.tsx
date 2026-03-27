"use client";

/**
 * Preview page — shows the rendered PDF before download.
 *
 * TODO (Phase 12):
 * - Render PDF via PDF.js (react-pdf library)
 * - Receive job_id from convert page via searchParams
 * - Provide Download .tex + Download .pdf buttons
 * - "Convert another" action
 */

import Link from "next/link";

export default function PreviewPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <p className="text-muted text-sm">
        PDF Preview — Coming in Phase 12
      </p>
      <Link
        href="/convert"
        className="text-accent underline text-sm hover:text-primary transition-colors"
      >
        ← Back to Convert
      </Link>
    </div>
  );
}
