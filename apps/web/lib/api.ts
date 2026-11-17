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

// 👇 خطاهای کنترلی Next (اجرای داینامیک، redirect و notFound) خطای واقعی نیستند
// و نباید داخل try/catch صفحه‌ها بلعیده شوند.
export function isNextControlFlowError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const digest = (error as { digest?: unknown }).digest;
  return (
    typeof digest === "string" &&
    (digest === "DYNAMIC_SERVER_USAGE" || digest.startsWith("NEXT_"))
  );
}

// 👇 فقط آدرس‌های http/https برای لینک‌های خارجی مجازند (جلوگیری از javascript: و data:)
export function safeExternalUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

export function assetUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

// 👇 نتیجهٔ واکشی جزئیات: محتوای ناموجود (۴۰۴) از خطای موقت سرور جدا می‌شود
export type DetailResult<T> =
  | { status: "ok"; data: T }
  | { status: "notfound" }
  | { status: "error" };

export async function fetchDetail<T>(url: string): Promise<DetailResult<T>> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (res.status === 404) return { status: "notfound" };
    if (!res.ok) return { status: "error" };
    const json = await res.json();
    if (!json?.data) return { status: "notfound" };
    return { status: "ok", data: json.data as T };
  } catch {
    return { status: "error" };
  }
}
