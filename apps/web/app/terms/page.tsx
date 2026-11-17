import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHead } from "@/components/ui/SectionHead";
import { Scale } from "lucide-react";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { API_URL } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize-html";

export const metadata: Metadata = {
  title: "شرایط استفاده",
  description: "شرایط استفاده و سلب مسئولیت پایگاه دکتر حسین کریمی.",
};

// تابع دریافت تنظیمات
async function getSettings() {
  const res = await fetch(`${API_URL}/public/settings`, {
    cache: "no-store",
  });
  return res.ok ? (await res.json()).data : null;
}

export default async function TermsPage() {
  const settings = await getSettings();

  return (
    <div className="pt-[120px] pb-24 bg-background min-h-screen">
      <Container className="max-w-[900px]">
        {/* هدر صفحه - عنوان دقیقاً "شرایط استفاده و سلب مسئولیت" */}
        <SectionHead
          as="h1"
          kicker="قوانین و مقررات"
          title="شرایط استفاده و سلب مسئولیت"
        />

        {/* کارت محتوای اصلی */}
        <div className="bg-white border border-border rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-accent to-transparent opacity-50" />

          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
            <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
              <Scale size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">
                شرایط استفاده از پایگاه
              </h2>
              {/* 👇 تاریخ به‌روزرسانی (اگر نیاز بود، می‌توانید از دیتابیس بخوانید) */}
              <p className="text-xs text-foreground-muted mt-1">
                آخرین به‌روزرسانی: <LastUpdated />
              </p>
            </div>
          </div>

          {/* 👇 متن داینامیک از دیتابیس (بدون مقدار پیش‌فرض) */}
          <div className="prose prose-slate max-w-none text-foreground-muted leading-[2.2] text-justify">
            {settings?.termsContent ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(settings?.termsContent || ""),
                }}
              />
            ) : (
              <p className="text-center py-10 text-foreground-muted">
                محتوایی برای این صفحه درج نشده است.
              </p>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
