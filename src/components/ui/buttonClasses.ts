export type ButtonVariant = "primary" | "ghost";
export type ButtonSize = "md" | "sm";

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
): string {
  const base = variant === "primary" ? "btn-primary" : "btn-ghost";
  return size === "sm" ? `${base} btn-sm` : base;
}
