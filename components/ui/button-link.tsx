import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import { buttonClass, type ButtonSize, type ButtonVariant } from "./styles";

type Props = ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize };

/** A link that looks like a Button, for navigation. */
export function ButtonLink({ variant = "secondary", size = "md", className, ...props }: Props) {
  return <Link data-ui="ButtonLink" className={buttonClass(variant, size, className)} {...props} />;
}
