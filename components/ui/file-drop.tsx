"use client";

import { useId, useState, type DragEvent } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";
import { ScanBar } from "./scan-bar";
import { focusRing } from "./styles";

type Props = {
  accept: string;
  onFile: (file: File) => void;
  label: string;
  hint: string;
  /** Shown instead of the label once a file is chosen. */
  fileName?: string;
  /** Shows the scan bar while the file is being read. */
  busy?: boolean;
  busyLabel: string;
};

export function FileDrop({ accept, onFile, label, hint, fileName, busy, busyLabel }: Props) {
  const id = useId();
  const [over, setOver] = useState(false);

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }

  return (
    <label
      data-ui="FileDrop"
      htmlFor={id}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      className={cn(
        "flex min-h-36 min-w-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-pop border-[2.5px] border-dashed border-ink px-4 py-6 text-center transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-pop/40",
        over ? "bg-sun" : "bg-paper hover:bg-card",
      )}
    >
      <input
        id={id}
        type="file"
        accept={accept}
        className={cn("sr-only", focusRing)}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
      <span className="grid size-11 place-items-center rounded-full border-2 border-ink bg-card">
        <Icon name={fileName ? "file" : "upload"} />
      </span>
      <span className="max-w-full truncate font-display font-extrabold">{fileName ?? label}</span>
      <span className="text-sm text-ink-soft">{hint}</span>
      {busy && (
        <span className="mt-1 w-full max-w-60">
          <ScanBar label={busyLabel} />
        </span>
      )}
    </label>
  );
}
