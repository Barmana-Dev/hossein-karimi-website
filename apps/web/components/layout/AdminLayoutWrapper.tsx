"use client";

import { usePathname } from "next/navigation";

export function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // اگر در صفحه لاگین هستیم، فقط خود صفحه را نشان بده (بدون سایدبار)
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // در بقیه صفحات پنل ادمین، سایدبار و هدر را نشان بده
  return <>{children}</>;
}
