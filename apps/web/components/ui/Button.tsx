"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "accent";
type Size = "sm" | "md" | "lg";

// 👇 onClick برای هر دو حالت دکمه و لینک قابل استفاده است
interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  children: React.ReactNode;
  href?: string;
  variant?: Variant;
  size?: Size;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white border border-primary hover:text-primary hover:bg-transparent",
  outline:
    "bg-transparent text-primary border border-primary/20 hover:border-primary/50",
  ghost:
    "bg-white/10 text-white border border-white/20 hover:bg-white hover:text-primary",
  accent:
    "bg-accent text-primary border border-accent hover:bg-accent-dark hover:text-white",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-[13px] rounded-lg",
  md: "px-6 py-3 text-sm rounded-xl",
  lg: "px-8 py-4 text-[15px] rounded-xl",
};

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className,
  onClick,
  type = "button",
  ...props
}: ButtonProps) {
  // رنگ خطوط برای هر نوع دکمه
  const borderColor =
    variant === "primary"
      ? "border-white/50"
      : variant === "accent"
        ? "border-white/50"
        : variant === "outline"
          ? "border-primary/50"
          : "border-white/50";

  // رنگ پس‌زمینه محو در حالت عادی
  const afterColor =
    variant === "primary"
      ? "bg-primary-light"
      : variant === "accent"
        ? "bg-accent-dark"
        : variant === "outline"
          ? "bg-primary/5"
          : "bg-white/20";

  const classes = cn(
    "group relative inline-flex items-center justify-center overflow-hidden transition-all duration-300",
    variants[variant],
    sizes[size],
    className,
  );

  const content = (
    <>
      {/* افکت خطوط (Before) */}
      <span
        className={cn(
          "absolute inset-0 opacity-0 scale-x-[0.1] group-hover:opacity-100 group-hover:scale-x-100 transition-all duration-300 border-t border-b z-0 pointer-events-none",
          borderColor,
        )}
      />

      {/* افکت پس‌زمینه محو (After) */}
      <span
        className={cn(
          "absolute inset-0 opacity-100 scale-x-100 group-hover:opacity-0 group-hover:scale-x-[0.1] transition-all duration-300 z-0 pointer-events-none",
          afterColor,
        )}
      />

      {/* محتوا */}
      <span className="relative z-10 flex items-center gap-2 transition-all duration-300 group-hover:tracking-widest">
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {content}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={classes} {...props}>
      {content}
    </button>
  );
}
