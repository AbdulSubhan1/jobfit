"use client";

import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { focusRing } from "./styles";

type Item<T extends string> = { id: T; label: string };
type Props<T extends string> = { items: Item<T>[]; value: T; onChange: (id: T) => void; label: string };

/** Segmented tabs. Arrow keys move between tabs; the panel uses id `panel-<id>`. */
export function Tabs<T extends string>({ items, value, onChange, label }: Props<T>) {
  const list = useRef<HTMLDivElement>(null);

  function onKeyDown(e: KeyboardEvent) {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    // In RTL the visual order flips, so flip the key too
    const dir = getComputedStyle(e.currentTarget).direction === "rtl" ? -step : step;
    const i = items.findIndex((t) => t.id === value);
    const next = items[(i + dir + items.length) % items.length];
    onChange(next.id);
    list.current?.querySelector<HTMLButtonElement>(`[data-tab="${next.id}"]`)?.focus();
  }

  return (
    <div
      ref={list}
      data-ui="Tabs"
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="flex w-full min-w-0 gap-1 overflow-x-auto rounded-btn border-[2.5px] border-ink bg-card p-1 shadow-pop-sm"
    >
      {items.map((t) => {
        const selected = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            data-tab={t.id}
            aria-selected={selected}
            aria-controls={`panel-${t.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.id)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 font-display text-sm font-extrabold whitespace-nowrap transition-colors",
              focusRing,
              selected ? "bg-ink text-mint" : "text-ink-soft hover:bg-mint",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
