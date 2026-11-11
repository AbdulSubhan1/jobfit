"use client";

import { useEffect, useState } from "react";

const COLOURS = ["bg-pop", "bg-sun", "bg-ink", "bg-have", "bg-card"];
const PIECES = 36;

type Piece = { id: number; colour: string; x: number; y: number; r: number; round: boolean };

/** A one-off burst when `fire` turns true. Decorative only, hidden from screen readers. */
export function Confetti({ fire }: { fire: boolean }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!fire) return;
    // Random on purpose: it's a visual flourish, never part of what's tested
    const frame = requestAnimationFrame(() =>
      setPieces(
        Array.from({ length: PIECES }, (_, id) => ({
          id,
          colour: COLOURS[id % COLOURS.length],
          x: (Math.random() - 0.5) * 520,
          y: Math.random() * 380 - 260,
          r: Math.random() * 720 - 360,
          round: id % 3 === 0,
        })),
      ),
    );
    const t = setTimeout(() => setPieces([]), 1600);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(t);
    };
  }, [fire]);

  if (!pieces.length) return null;
  return (
    <div data-ui="Confetti" aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          ref={(el) => {
            el?.style.setProperty("--x", `${p.x}px`);
            el?.style.setProperty("--y", `${p.y}px`);
            el?.style.setProperty("--r", `${p.r}deg`);
          }}
          className={`absolute start-1/2 top-1/2 size-2.5 animate-confetti border border-ink ${p.colour} ${p.round ? "rounded-full" : "rounded-[2px]"}`}
        />
      ))}
    </div>
  );
}
