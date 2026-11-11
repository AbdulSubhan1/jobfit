"use client";

import { cn } from "@/lib/cn";
import { focusRing } from "./styles";

type Props = {
  text: string;
  /** Called with a word the user clicked to hide. Omit for read-only text. */
  onWordClick?: (word: string) => void;
  /** Accessible name for each clickable word, e.g. (w) => `Hide “${w}”`. */
  wordLabel?: (word: string) => string;
};

const TOKENS = /(\[[A-Z]+-\d+\]|[\p{L}\p{N}][\p{L}\p{N}'’.@+#-]*[\p{L}\p{N}+#]|[\p{L}\p{N}])/u;

/** Masked text in mono: tags show as pink chips; other words can be clicked to hide them too. */
export function MaskedText({ text, onWordClick, wordLabel }: Props) {
  const parts = text.split(TOKENS);
  return (
    <div
      data-ui="MaskedText"
      dir="auto"
      className="rounded-btn border-2 border-ink bg-paper p-3 font-mono text-xs leading-6 [overflow-wrap:anywhere] whitespace-pre-wrap sm:text-[13px]"
    >
      {parts.map((part, i) => {
        if (i % 2 === 0) return part;
        if (/^\[[A-Z]+-\d+\]$/.test(part)) {
          return (
            <mark key={i} className="rounded border border-ink bg-pop px-1 font-bold text-white">
              {part}
            </mark>
          );
        }
        if (!onWordClick) return part;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onWordClick(part)}
            aria-label={wordLabel?.(part)}
            className={cn("rounded px-px hover:bg-sun hover:line-through", focusRing)}
          >
            {part}
          </button>
        );
      })}
    </div>
  );
}
