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
  },
};

export default nextConfig;
