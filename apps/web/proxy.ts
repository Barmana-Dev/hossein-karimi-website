import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// در Next.js 16 نام middleware به proxy تغییر کرده است (رفتار یکسان است)
export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = request.nextUrl.pathname === "/login";

  // اگر به مسیر ادمین می‌رود و توکن ندارد -> برود به لاگین
  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // اگر در صفحه لاگین است و توکن دارد -> برود به داشبورد
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // این Proxy روی مسیرهای ادمین و لاگین اجرا می‌شود
  matcher: ["/admin/:path*", "/login"],
};
