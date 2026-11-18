"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ArticleShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        // بستن پنجرهٔ اشتراک‌گذاری توسط کاربر خطا نیست
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("لینک مقاله را کپی کنید:", url);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="اشتراک‌گذاری مقاله"
      title={copied ? "لینک کپی شد" : "اشتراک‌گذاری مقاله"}
      className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-foreground-muted hover:bg-primary hover:text-white transition-colors"
    >
      {copied ? <Check size={16} /> : <Share2 size={16} />}
    </button>
  );
}
