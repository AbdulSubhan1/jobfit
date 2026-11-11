"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { NumberTicker } from "./number-ticker";

type Props = {
  /** 0–100, or null when there isn't enough to score. */
  value: number | null;
  size?: "md" | "lg";
  /** Read by screen readers, e.g. "Match score". */
  label: string;
};

const R = 42;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function ScoreRing({ value, size = "md", label }: Props) {
  const ring = useRef<SVGCircleElement>(null);

  // Start empty, then set the target offset so the stroke animates in
  useEffect(() => {
    const el = ring.current;
    if (!el) return;
    el.style.setProperty("--ring-offset", String(CIRCUMFERENCE));
    const id = requestAnimationFrame(() =>
      el.style.setProperty("--ring-offset", String(CIRCUMFERENCE * (1 - (value ?? 0) / 100))),
    );
    return () => cancelAnimationFrame(id);
  }, [value]);

  return (
    <div
      data-ui="ScoreRing"
      role="img"
      aria-label={value === null ? label : `${label}: ${value}%`}
      className={cn("relative grid shrink-0 place-items-center", size === "lg" ? "size-32" : "size-24")}
    >
      <svg viewBox="0 0 96 96" className="absolute inset-0 size-full -rotate-90" aria-hidden>
        <circle
          cx="48"
          cy="48"
          r={R}
          fill="none"
          strokeWidth="10"
          className={cn("stroke-track", value === null && "[stroke-dasharray:6_6]")}
        />
        {value !== null && (
          <circle
            ref={ring}
            cx="48"
            cy="48"
            r={R}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            className="stroke-pop transition-[stroke-dashoffset] duration-1000 ease-out [stroke-dashoffset:var(--ring-offset,264)]"
          />
        )}
      </svg>
      <span className={cn("font-sans font-extrabold tracking-tight", size === "lg" ? "text-3xl" : "text-2xl")}>
        {value === null ? "–" : <NumberTicker value={value} suffix="%" />}
      </span>
    </div>
  );
}
