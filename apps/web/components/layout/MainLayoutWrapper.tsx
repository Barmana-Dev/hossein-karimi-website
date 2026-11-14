"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ScrollButtons } from "@/components/ui/ScrollButtons";
import { Suspense } from "react";

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // اگر در مسیر ادمین یا لاگین هستیم، هدر و فوتر سایت را نشان نده
  const isAdmin = pathname.startsWith("/admin");
  const isLogin = pathname === "/login";
  if (isAdmin || isLogin) {
    return <>{children}</>;
  }

  // در بقیه صفحات سایت، هدر و فوتر را نشان بده
  return (
    <>
      <Suspense fallback={<div className="h-[84px]" />}>
        <Header />
      </Suspense>

      <main className="min-h-screen">{children}</main>
      <Footer />
      <ScrollButtons />
    </>
  );
}
