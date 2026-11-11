import type { ComponentProps } from "react";
import { buttonClass, type ButtonSize, type ButtonVariant } from "./styles";

type Props = ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize };

export function Button({ variant = "secondary", size = "md", className, type = "button", ...props }: Props) {
  return <button data-ui="Button" type={type} className={buttonClass(variant, size, className)} {...props} />;
}
