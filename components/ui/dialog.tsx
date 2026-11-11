"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";
import { focusRing, slabSurface } from "./styles";

type Props = { open: boolean; onClose: () => void; title: string; closeLabel: string; children: ReactNode };

/** A modal on the native <dialog>, so focus trapping and Escape come from the browser. */
export function Dialog({ open, onClose, title, closeLabel, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      data-ui="Dialog"
      aria-labelledby="dialog-title"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className={cn(
        slabSurface,
        "fixed inset-0 m-auto h-fit w-[min(100%-2rem,42rem)] p-0 text-ink backdrop:bg-ink/55 backdrop:backdrop-blur-sm open:animate-rise",
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b-[3px] border-ink px-5 py-3">
        <h2 id="dialog-title" className="min-w-0 font-display text-lg font-extrabold">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className={cn("grid size-9 place-items-center rounded-lg hover:bg-mint", focusRing)}
        >
          <Icon name="x" />
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
    </dialog>
  );
}
