import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
  containerClassName?: string;
}

export function Icon({
  icon: IconComponent,
  size = 24,
  className,
  containerClassName,
}: IconProps) {
  return (
    <div
      className={cn(
        "w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center transition-colors",
        containerClassName,
      )}
    >
      <IconComponent size={size} className={className} strokeWidth={1.7} />
    </div>
  );
}
