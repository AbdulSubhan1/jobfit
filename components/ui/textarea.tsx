import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { control } from "./styles";

type Props = ComponentProps<"textarea">;

export function Textarea({ className, rows = 8, ...props }: Props) {
  return (
    <textarea
      data-ui="Textarea"
      rows={rows}
      className={cn(control, "resize-y leading-relaxed", className)}
      {...props}
    />
  );
}
