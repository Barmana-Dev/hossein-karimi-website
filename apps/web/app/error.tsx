"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="max-w-[500px] w-full bg-white border border-border rounded-3xl p-8 md:p-12 shadow-xl text-center relative z-10">
        <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
          <AlertCircle size={40} />
        </div>

        <h1 className="text-2xl font-black text-primary mb-4">
          مشکلی پیش آمد!
        </h1>
        <p className="text-foreground-muted leading-relaxed mb-8">
          متأسفانه در بارگذاری این بخش خطایی رخ داد. لطفاً دوباره تلاش کنید یا
          به صفحه اصلی بازگردید.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => reset()} variant="primary">
            تلاش مجدد
          </Button>
          <Button href="/" variant="outline">
            بازگشت به خانه
          </Button>
        </div>
      </div>
    </div>
  );
}
