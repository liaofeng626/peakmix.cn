import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

function classes(variant: Variant, size: Size, disabled?: boolean) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition focus:outline-none focus:ring-2 focus:ring-stone-900/30 disabled:cursor-not-allowed";
  const sizeCls = size === "sm" ? "px-4 py-2 text-sm" : "px-6 py-2.5 text-sm";
  const variants: Record<Variant, string> = {
    primary:
      "bg-stone-900 text-white hover:bg-stone-800 disabled:bg-stone-900 disabled:opacity-50",
    secondary:
      "border border-stone-300 bg-white text-stone-900 hover:border-stone-400 hover:bg-stone-50 disabled:opacity-50",
    ghost: "text-stone-700 hover:bg-stone-100 disabled:opacity-50",
    danger:
      "bg-red-600 text-white hover:bg-red-500 disabled:bg-red-600 disabled:opacity-50",
  };
  const disabledCls = disabled ? "pointer-events-none" : "";
  return [base, sizeCls, variants[variant], disabledCls].filter(Boolean).join(" ");
}

/**
 * 轻量按钮：不引入额外 UI 框架，保持风格统一
 */
export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      {...props}
      className={`${classes(variant, size, props.disabled)} ${className}`}
    />
  );
}

