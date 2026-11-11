"use client";

import { useEffect, useState } from "react";

type Props = { value: number; suffix?: string; duration?: number };

/** Counts up from 0 to value. Always DM Sans with fixed-width digits so the number doesn't jump. */
export function NumberTicker({ value, suffix = "", duration = 900 }: Props) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const ms = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : duration;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = ms === 0 ? 1 : Math.min(1, (now - start) / ms);
      setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return (
    <span data-ui="NumberTicker" className="font-sans tabular-nums">
      {shown}
      {suffix}
    </span>
  );
}
