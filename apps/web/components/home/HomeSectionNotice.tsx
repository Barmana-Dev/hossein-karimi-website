"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Container } from "@/components/ui/Container";

interface HomeSectionNoticeProps {
  title?: string;
  message: string;
}

export function HomeSectionNotice({ title, message }: HomeSectionNoticeProps) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    router.refresh();
    // بازگرداندن حالت دکمه پس از مدت کوتاه
    window.setTimeout(() => setIsRetrying(false), 1500);
  };

  return (
    <section className="section-padding bg-background">
      <Container>
        <div className="max-w-[700px] mx-auto bg-white border border-border rounded-2xl p-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          {title && (
            <h2 className="text-lg font-bold text-primary mb-2">{title}</h2>
          )}
          <p className="text-sm text-foreground-muted leading-relaxed mb-6">
            {message}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold transition-colors hover:bg-primary-light disabled:opacity-60"
          >
            <RefreshCw size={16} className={isRetrying ? "animate-spin" : ""} />
            تلاش دوباره
          </button>
        </div>
      </Container>
    </section>
  );
}
