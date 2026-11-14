import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
}

export function Card({
  children,
  className,
  hoverEffect = true,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-border rounded-2xl p-6 md:p-8 transition-all duration-400",
        hoverEffect &&
          "hover:shadow-lg hover:border-accent/30 hover:-translate-y-1",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
