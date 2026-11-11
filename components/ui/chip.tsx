"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { CHIP_TONES, focusRing, type Tone } from "./styles";

type Props = {
  tone?: Tone;
  /** Pop-in delay in ms, so a row of chips appears one by one. */
  delay?: number;
  onClick?: () => void;
  pressed?: boolean;
  children: ReactNode;
};

const BASE =
  "inline-flex animate-pop-in items-center gap-1 rounded-lg border-2 border-ink px-2.5 py-0.5 text-sm font-bold [animation-delay:var(--delay,0ms)]";

export function Chip({ tone = "neutral", delay = 0, onClick, pressed, children }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    ref.current?.style.setProperty("--delay", `${delay}ms`);
  }, [delay]);

  if (onClick) {
    return (
      <button
        ref={ref as React.RefObject<HTMLButtonElement>}
        data-ui="Chip"
        type="button"
        aria-pressed={pressed}
        onClick={onClick}
        className={cn(BASE, CHIP_TONES[tone], focusRing, "cursor-pointer hover:-translate-y-0.5")}
      >
        {children}
      </button>
    );
  }
  return (
    <span ref={ref} data-ui="Chip" className={cn(BASE, CHIP_TONES[tone])}>
      {children}
    </span>
  );
}
