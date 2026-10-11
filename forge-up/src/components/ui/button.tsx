import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

export function buttonClassName(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50",
    size === "sm" ? "h-9 px-3 text-sm" : "h-11 px-4 text-sm",
    variant === "primary" &&
      "bg-primary text-primary-foreground hover:opacity-90",
    variant === "secondary" &&
      "border border-border bg-card text-foreground hover:bg-muted",
    variant === "ghost" && "text-foreground hover:bg-muted",
    variant === "danger" && "bg-danger text-white hover:opacity-90",
    className,
  );
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  return (
    <button className={buttonClassName(variant, size, className)} {...props} />
  );
}
