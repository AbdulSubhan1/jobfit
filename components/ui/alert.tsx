import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

type Props = { tone?: "info" | "error"; children: ReactNode };

export function Alert({ tone = "info", children }: Props) {
  return (
    <div
      data-ui="Alert"
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex min-w-0 items-start gap-2 rounded-btn border-2 border-ink px-3 py-2.5 text-sm font-medium",
        tone === "error" ? "bg-miss" : "bg-card",
      )}
    >
      <Icon name={tone === "error" ? "x" : "shield"} size={16} className="mt-0.5" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
