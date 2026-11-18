"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LoadErrorProps {
  message?: string;
  onRetry: () => void;
}

// 👇 خطای دریافت داده از «خالی بودن محتوا» جدا می‌شود و امکان تلاش دوباره دارد
export function LoadError({
  message = "دریافت اطلاعات از سرور انجام نشد. لطفاً دوباره تلاش کنید.",
  onRetry,
}: LoadErrorProps) {
  return (
    <div
      role="alert"
      className="text-center py-16 px-6 bg-white border border-red-200 rounded-2xl"
    >
      <div className="w-14 h-14 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
        <AlertCircle size={28} />
      </div>
      <p className="text-foreground-muted mb-6">{message}</p>
      <Button onClick={onRetry} variant="primary" className="gap-2">
        <RefreshCw size={16} />
        تلاش دوباره
      </Button>
    </div>
  );
}
