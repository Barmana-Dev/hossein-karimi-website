import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHead } from "@/components/ui/SectionHead";
import { API_URL } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize-html";

export const metadata: Metadata = {
  title: "حریم خصوصی",
  description:
    "سیاست حریم خصوصی و نحوه پردازش داده‌های کاربران در پایگاه دکتر حسین کریمی.",
};

// تابع دریافت تنظیمات
async function getSettings() {
  const res = await fetch(`${API_URL}/public/settings`, {
    cache: "no-store",
  });
  return res.ok ? (await res.json()).data : null;
}

export default async function PrivacyPage() {
  const settings = await getSettings();

  return (
    <div className="pt-[120px] pb-24 bg-background min-h-screen">
      <Container className="max-w-[800px]">
        {/* 👇 عنوان و توضیحات داینامیک (از seoTitle و seoDescription) */}
        <SectionHead
          as="h1"
          kicker="قوانین و مقررات"
          title={settings?.seoTitle || "سیاست حریم خصوصی"}
          description={settings?.seoDescription || ""}
        />

        <div className="bg-white border border-border rounded-2xl p-8 md:p-12 prose prose-slate max-w-none text-foreground-muted leading-[2] text-justify">
          {/* 👇 نمایش متن داینامیک از دیتابیس (بدون مقدار پیش‌فرض) */}
          {settings?.privacyContent ? (
            <div
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(settings?.privacyContent || ""),
              }}
            />
          ) : (
            // 👇 اگر متنی در دیتابیس وجود نداشت، فقط یک پیام ساده نمایش داده می‌شود
            <p className="text-center py-10 text-foreground-muted">
              محتوایی برای این صفحه درج نشده است.
            </p>
          )}
        </div>
      </Container>
    </div>
  );
}
