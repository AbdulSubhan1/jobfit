import { cn } from "@/lib/cn";

type Props = { size?: "md" | "lg" };

/** The JobFit wordmark: "Fit" sits in a tilted pink box. */
export function Logo({ size = "md" }: Props) {
  return (
    <span
      data-ui="Logo"
      dir="ltr"
      className={cn(
        "inline-flex items-center font-display font-extrabold tracking-tight",
        size === "lg" ? "text-3xl" : "text-xl",
      )}
    >
      Job
      <span className="ms-0.5 inline-block -rotate-3 rounded-md border-2 border-ink bg-pop px-1 text-white">Fit</span>
    </span>
  );
}
