import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = { tone?: "sun" | "pop"; children: ReactNode };

/** A wobbling badge, pinned to a Card or used inline for short claims. */
export function Sticker({ tone = "sun", children }: Props) {
  return (
    <span
      data-ui="Sticker"
      className={cn(
        "inline-block animate-wobble rounded-full border-[2.5px] border-ink px-3 py-1 font-display text-xs font-extrabold whitespace-nowrap",
        tone === "sun" ? "bg-sun text-ink" : "bg-pop text-white",
      )}
    >
      {children}
    </span>
  );
}
