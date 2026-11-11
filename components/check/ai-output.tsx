"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button, Icon, StreamText } from "@/components/ui";
import { downloadText } from "@/lib/download";

type Props = {
  text: string;
  streaming: boolean;
  filename: string;
  onRegenerate?: () => void;
  onStop?: () => void;
};

export function AiOutput({ text, streaming, filename, onRegenerate, onStop }: Props) {
  const t = useTranslations("ai");
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="grid gap-4">
      <div className="min-h-40 rounded-btn border-2 border-ink bg-card p-4 sm:p-5">
        <StreamText text={text} streaming={streaming} />
      </div>
      <div className="flex flex-wrap gap-2">
        {streaming ? (
          onStop && (
            <Button size="sm" onClick={onStop}>
              <Icon name="x" size={16} /> {t("stop")}
            </Button>
          )
        ) : (
          <>
            <Button size="sm" onClick={copy} disabled={!text}>
              <Icon name={copied ? "check" : "copy"} size={16} /> {copied ? t("copied") : t("copy")}
            </Button>
            <Button size="sm" onClick={() => downloadText(filename, text)} disabled={!text}>
              <Icon name="download" size={16} /> {t("download")}
            </Button>
            {onRegenerate && (
              <Button size="sm" variant="ghost" onClick={onRegenerate}>
                <Icon name="refresh" size={16} /> {t("regenerate")}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
