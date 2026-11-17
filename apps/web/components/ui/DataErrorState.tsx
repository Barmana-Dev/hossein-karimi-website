"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

interface DataErrorStateProps {
  title?: string;
  message?: string;
}

// 👇 خطای موقت سرور یا شبکه؛ با ۴۰۴ (محتوای ناموجود) اشتباه گرفته نمی‌شود
export function DataErrorState({
  title = "دسترسی به این محتوا ممکن نشد",
  message = "ارتباط با سرور برقرار نشد یا خطای موقتی رخ داد. لطفاً دوباره تلاش کنید.",
}: DataErrorStateProps) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    router.refresh();
    window.setTimeout(() => setIsRetrying(false), 1500);
  };

  return (
    <div className="bg-background min-h-screen pt-[140px] pb-24">
      <Container>
        <div className="max-w-[600px] mx-auto bg-white border border-border rounded-3xl p-8 md:p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-2xl font-black text-primary mb-4">{title}</h1>
          <p className="text-foreground-muted leading-relaxed mb-8">
            {message}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={handleRetry} variant="primary" disabled={isRetrying}>
              <RefreshCw
                size={16}
                className={isRetrying ? "animate-spin" : ""}
              />
              تلاش دوباره
            </Button>
            <Button href="/" variant="outline">
              بازگشت به خانه
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
