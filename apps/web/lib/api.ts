const DEFAULT_API_URL = "http://localhost:4000/api/v1";

// آدرس پایه API از متغیر محیطی خوانده می‌شود تا در هر محیطی قابل تغییر باشد
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL
).replace(/\/+$/, "");

// ریشه سرور (بدون /api/v1) برای ساخت آدرس فایل‌های آپلودشده
export const API_ORIGIN = API_URL.replace(/\/api\/v1$/, "");

// آدرس عمومی سایت (برای sitemap و متادیتا)
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://hosseinkarimi.com"
).replace(/\/+$/, "");

export function assetUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}
