import type { NextConfig } from "next";
import path from "node:path";

// دامنه و پورت سرور API از همان متغیر مشترک فرانت‌اند خوانده می‌شود
const apiOrigin = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
).replace(/\/api\/v1\/?$/, "");

const parsedApiOrigin = new URL(apiOrigin);

// هاست‌های اضافی تصویر را می‌توان با کاما جدا کرد:
// NEXT_PUBLIC_IMAGE_HOSTS=cdn.example.com,images.example.com
const extraImageHosts = (process.env.NEXT_PUBLIC_IMAGE_HOSTS || "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

const remotePatterns: NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
> = [
  {
    protocol: parsedApiOrigin.protocol.replace(":", "") as "http" | "https",
    hostname: parsedApiOrigin.hostname,
    port: parsedApiOrigin.port,
    pathname: "/uploads/**",
  },
  ...extraImageHosts.map((hostname) => ({
    protocol: "https" as const,
    hostname,
    pathname: "/**",
  })),
];

// 👇 محافظ انتشار: build پروداکشن بدون آدرس API نباید با localhost منتشر شود
if (process.env.NODE_ENV === "production") {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL برای build پروداکشن الزامی است. مقدار آن را در apps/web/.env.production قرار دهید.",
    );
  }
  if (/localhost|127\.0\.0\.1/i.test(apiOrigin)) {
    console.warn(
      "⚠️  NEXT_PUBLIC_API_URL به localhost اشاره می‌کند؛ قبل از انتشار نهایی، آدرس واقعی API را در .env.production بگذارید.",
    );
  }
}

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd(), "../.."),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  images: {
    remotePatterns,
    // تبدیل خودکار به فرمت‌های مدرن + کش طولانی‌مدت تصاویر بهینه‌شده
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    qualities: [60, 70, 75, 80, 82, 90],
    // فقط در محیط توسعه اجازهٔ خواندن تصویر از API لوکال داده می‌شود
    ...(/localhost|127\.0\.0\.1/i.test(apiOrigin)
      ? { dangerouslyAllowLocalIP: true }
      : {}),
  },
};

export default nextConfig;
