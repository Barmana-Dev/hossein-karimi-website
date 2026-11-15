import { cn } from "@/lib/utils";

interface SectionHeadProps {
  kicker: string;
  title: string;
  description?: string;
  variant?: "light" | "dark";
  align?: "center" | "right";
}

export function SectionHead({
  kicker,
  title,
  description,
  variant = "light",
  align = "center",
}: SectionHeadProps) {
  const isDark = variant === "dark";
  return (
    <div
      className={cn(
        "max-w-[680px] mb-12 md:mb-[70px] relative",
        align === "center" ? "mx-auto text-center" : "text-right",
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-3 text-xs font-bold tracking-[2px] mb-[18px] uppercase",
          isDark ? "text-accent-light" : "text-accent",
        )}
      >
        {align === "center" && (
          <span className="w-8 h-px bg-gradient-to-l from-transparent to-accent" />
        )}
        {kicker}
        {align === "center" && (
          <span className="w-8 h-px bg-gradient-to-r from-transparent to-accent" />
        )}
      </span>
      <h2
        className={cn(
          "text-[clamp(30px,3.8vw,35px)] font-extrabold tracking-[-0.025em] leading-[1.3] mb-[18px]",
          isDark ? "text-white" : "text-primary",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "text-[15.5px] leading-[1.9]",
            isDark ? "text-white/60" : "text-text-muted",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
