import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { slab } from "./styles";

type Props = {
  tone?: "white" | "paper";
  /** Gently floats up and down: hero and score cards only. */
  float?: boolean;
  /** A Sticker pinned to the top corner. */
  sticker?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Card({ tone = "white", float, sticker, className, children }: Props) {
  return (
    <div
      data-ui="Card"
      className={cn(slab, "p-4 sm:p-5", tone === "paper" && "bg-paper", float && "animate-float", className)}
    >
      {sticker && <div className="absolute -end-3 -top-4 z-10">{sticker}</div>}
      {children}
    </div>
  );
}
