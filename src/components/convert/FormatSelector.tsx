"use client";

/**
 * FormatSelector — lets the user pick an input format.
 *
 * TODO (Phase 8):
 * - Show an icon grid for each supported format
 *   (PDF, DOCX, PPTX, JPG/PNG, Markdown, TXT)
 * - On selection, notify parent so DropZone updates its
 *   accepted MIME types / file extensions
 */

interface FormatSelectorProps {
  /** Currently selected format identifier (e.g. "pdf", "docx"). */
  selectedFormat: string;
  /** Called when the user picks a different format. */
  onFormatChange: (format: string) => void;
}

export default function FormatSelector({
  selectedFormat: _selectedFormat,
  onFormatChange: _onFormatChange,
}: FormatSelectorProps) {
  return (
    <div className="text-muted text-xs text-center p-4 border border-dashed border-border rounded-lg">
      Format Selector — Coming in Phase 8
    </div>
  );
}
