"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Alert, Button, FileDrop, Icon, Textarea } from "@/components/ui";
import { LIMITS } from "@/constants/config";
import { extractPdfText, PdfError } from "@/lib/pdf/extract-text";

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** Label for the loaded CV: a file name, or the sample's name. */
  source: string | null;
  onSourceChange: (source: string | null) => void;
};

export function CvInput({ value, onChange, source, onSourceChange }: Props) {
  const t = useTranslations("check.cv");
  const [mode, setMode] = useState<"pdf" | "text">("pdf");
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<PdfError["reason"] | null>(null);

  async function read(file: File) {
    setError(null);
    setReading(true);
    try {
      onChange((await extractPdfText(file)).slice(0, LIMITS.cvChars));
      onSourceChange(file.name);
    } catch (e) {
      const reason = e instanceof PdfError ? e.reason : "not-pdf";
      setError(reason);
      onChange("");
      onSourceChange(null);
      // Scanned PDFs have no text layer: go straight to pasting
      if (reason === "empty") setMode("text");
    } finally {
      setReading(false);
    }
  }

  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="grid min-w-0 content-start gap-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={mode === "text" ? "cv-text" : undefined} className="font-display text-lg font-extrabold">
          {t("label")}
        </label>
        <Button variant="ghost" size="sm" onClick={() => setMode(mode === "pdf" ? "text" : "pdf")}>
          <Icon name={mode === "pdf" ? "text" : "upload"} size={16} />
          {mode === "pdf" ? t("pasteInstead") : t("uploadInstead")}
        </Button>
      </div>

      {mode === "pdf" ? (
        <FileDrop
          accept="application/pdf,.pdf"
          onFile={read}
          label={t("drop")}
          hint={source && value ? t("loaded", { words }) : t("hint")}
          fileName={source ?? undefined}
          busy={reading}
          busyLabel={t("reading")}
        />
      ) : (
        <Textarea
          id="cv-text"
          rows={12}
          maxLength={LIMITS.cvChars}
          placeholder={t("placeholder")}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onSourceChange(null);
          }}
        />
      )}
      {error && <Alert tone="error">{t(`errors.${error}`)}</Alert>}
    </div>
  );
}
