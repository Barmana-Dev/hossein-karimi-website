import Image from "next/image";
import { assetUrl } from "@/lib/api";

/**
 * تصویر بهینه‌شده با next/image.
 * اگر تصویر روی هاستی باشد که در next.config ثبت نشده، به <img> ساده برمی‌گردد
 * تا خطای زمان اجرا رخ ندهد.
 */

const apiOrigin = (() => {
  try {
    return new URL(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1",
    ).host;
  } catch {
    return "";
  }
})();

const extraHosts = (process.env.NEXT_PUBLIC_IMAGE_HOSTS || "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

function canOptimize(src: string): boolean {
  if (src.startsWith("/")) return true;
  try {
    const url = new URL(src);
    return url.host === apiOrigin || extraHosts.includes(url.hostname);
  } catch {
    return false;
  }
}

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
}

export function SmartImage({
  src,
  alt,
  className = "",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  quality = 80,
}: SmartImageProps) {
  const resolved = assetUrl(src);

  if (!canOptimize(resolved)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolved}
        alt={alt}
        className={className}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
      />
    );
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      fill
      sizes={sizes}
      quality={quality}
      priority={priority}
      className={className}
    />
  );
}
