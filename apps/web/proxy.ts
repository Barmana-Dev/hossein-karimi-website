import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// در Next.js 16 نام middleware به proxy تغییر کرده است (رفتار یکسان است)
export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  // اگر به مسیر ادمین می‌رود و توکن ندارد -> برود به لاگین
  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 👇 وجود کوکی به‌تنهایی یعنی نشست معتبر نیست؛ هدایت /login به /admin
  // با کوکی خراب باعث حلقهٔ بی‌پایان می‌شد. اعتبار نشست در خود صفحه بررسی می‌شود.

  return NextResponse.next();
}

export const config = {
  // این Proxy روی مسیرهای ادمین و لاگین اجرا می‌شود
  matcher: ["/admin/:path*", "/login"],
};
