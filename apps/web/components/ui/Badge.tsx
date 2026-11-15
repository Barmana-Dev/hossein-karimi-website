import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "accent" | "draft" | "success";
  className?: string;
}) {
  const styles = {
    default: "bg-primary/5 text-primary border-primary/10",
    accent: "bg-accent-light/10 text-accent border-accent/25",
    draft:
      "bg-[rgba(212,146,58,.12)] text-[#a06a2d] border-[rgba(212,146,58,.4)] border-dashed",
    success: "bg-success/10 text-success border-success/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
