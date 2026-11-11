import { cn } from "@/lib/cn";

// Class recipes shared by more than one library component. Change a look here and every user of it follows.
// There is no class merging, so never override these through className: add a variant instead.

/** Thick-outlined white surface with a hard shadow. Has no position, so a modal dialog keeps its own. */
export const slabSurface = "min-w-0 rounded-pop border-[3px] border-ink bg-card shadow-pop-lg";

/** A slab that anchors absolutely placed children (stickers): cards. */
export const slab = `relative ${slabSurface}`;

/** Text inputs and textareas. */
export const control =
  "w-full min-w-0 rounded-btn border-[2.5px] border-ink bg-card px-3 py-2.5 text-sm text-ink shadow-pop-sm outline-none transition-shadow placeholder:text-ink-soft/60 focus:ring-4 focus:ring-pop/30 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-pop";

/** Keyboard focus ring for anything clickable. */
export const focusRing = "focus-visible:ring-4 focus-visible:ring-pop/40 focus-visible:outline-none";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

// Lifts on hover, presses flat on click
const PRESSABLE =
  "border-[2.5px] border-ink shadow-pop transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-md active:translate-x-1 active:translate-y-1 active:shadow-none";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: cn(PRESSABLE, "bg-ink text-mint"),
  secondary: cn(PRESSABLE, "bg-card text-ink"),
  ghost: "text-ink-soft hover:bg-ink/5 hover:text-ink",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-6 text-base",
};

export function buttonClass(variant: ButtonVariant = "secondary", size: ButtonSize = "md", className?: string) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-btn font-display font-extrabold whitespace-nowrap disabled:pointer-events-none disabled:opacity-50",
    focusRing,
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export type Tone = "have" | "miss" | "neutral";

export const CHIP_TONES: Record<Tone, string> = {
  have: "bg-have",
  miss: "bg-miss",
  neutral: "bg-card",
};
