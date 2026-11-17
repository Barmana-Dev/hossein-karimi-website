import type { Metadata } from "next";
import { sanitizeHtml } from "@/lib/sanitize-html";
import {
  Award,
  BookOpen,
  Target,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHead } from "@/components/ui/SectionHead";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { API_URL } from "@/lib/api";
import { SmartImage } from "@/components/ui/SmartImage";

export const metadata: Metadata = {
  title: "درباره من",
  description:
    "بیوگرافی، سوابق تحصیلی و رویکرد حرفه‌ای دکتر حسین کریمی در حوزه حقوق، امور گمرکی و تجارت بین‌الملل.",
  openGraph: {
    title: "درباره من | دکتر حسین کریمی",
    description: "بیوگرافی و سوابق حرفه‌ای",
    type: "profile",
  },
};

// export const instant = false;

async function getSettings() {
  const res = await fetch(`${API_URL}/public/settings`, {
    cache: "no-store",
  });
  return res.ok ? (await res.json()).data : null;
}

// 👇 دریافت فقط سوابق با دسته‌بندی "آموزشی"
async function getEducationExperiences() {
  const res = await fetch(`${API_URL}/public/experience`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = await res.json();
  // فیلتر کردن سوابق بر اساس دسته‌بندی "education" (آموزشی)
  return json.data.filter(
    (exp: { category: string }) => exp.category === "education",
  );
}

export default async function AboutPage() {
  const settings = await getSettings();
  const educations = await getEducationExperiences();

  return (
    <div className="pt-[120px] pb-24 bg-background min-h-screen">
      <Container>
        <SectionHead as="h1" kicker="درباره من" title={settings?.siteTitle} />

        <div className="grid lg:grid-cols-[1fr_1.8fr] gap-8 lg:gap-12 items-start max-w-[1100px] mx-auto">
          {/* ستون راست (در RTL): پروفایل و اطلاعات کلیدی */}
          <div className="space-y-6">
            {/* کارت پرتره */}
            <div className="bg-primary rounded-3xl p-6 relative overflow-hidden shadow-xl">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/20 rounded-full blur-[30px] pointer-events-none" />
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-accent/10 rounded-full blur-[30px] pointer-events-none" />

              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-primary-light to-primary border border-white/10 flex flex-col items-center justify-center text-white/50 mb-6">
                {settings?.portraitImage ? (
                  <SmartImage
                    src={settings.portraitImage}
                    alt="پرتره رسمی"
                    sizes="(max-width: 1024px) 100vw, 420px"
                    className="object-cover z-0"
                  />
                ) : (
                  <>
                    <svg
                      className="w-16 h-16 opacity-30 mb-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 1115 0v.75H4.5v-.75z"
                      />
                    </svg>
                    <span className="text-sm font-medium">پرتره رسمی</span>
                  </>
                )}
              </div>

              {/* اطلاعات کلیدی */}
              <div className="relative z-10">
                <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Target size={18} className="text-accent" /> اطلاعات کلیدی
                </h2>
                <ul className="space-y-4 text-sm">
                  <li className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/60">حوزه فعالیت:</span>
                    <span className="font-semibold text-white">
                      {settings?.keyField || "—"}
                    </span>
                  </li>
                  <li className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/60">مدرک تحصیلی:</span>
                    <span className="font-semibold text-white">
                      {settings?.keyDegree || "—"}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-white/60">زبان‌ها:</span>
                    <span className="font-semibold text-white">
                      {settings?.keyLanguages || "—"}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* دکمه‌های اقدام */}
            <div className="flex flex-col gap-3">
              <Button
                href="/experience"
                variant="primary"
                className="w-full justify-between group"
              >
                <span>مشاهده سوابق حرفه‌ای</span>
                <ArrowLeft
                  size={18}
                  className="group-hover:-translate-x-1 transition-transform"
                />
              </Button>
              <Button
                href="/contact"
                variant="outline"
                className="w-full justify-between group"
              >
                <span>درخواست ارتباط</span>
                <ArrowLeft
                  size={18}
                  className="group-hover:-translate-x-1 transition-transform"
                />
              </Button>
            </div>
          </div>

          {/* ستون چپ (در RTL): متن و محتوا */}
          <div className="space-y-8">
            {/* روایت حرفه‌ای */}
            <div className="bg-white border border-border rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-accent" />
              <h2 className="text-[1.3rem] font-bold text-primary mb-6 flex items-center gap-3">
                <BookOpen size={24} className="text-accent" />
                روایت حرفه‌ای
              </h2>
              <div className="text-foreground-muted leading-[2] text-justify space-y-4 text-[15px]">
                {settings?.aboutContent ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(settings?.aboutContent || ""),
                    }}
                  />
                ) : (
                  <p>متنی برای روایت حرفه‌ای درج نشده است.</p>
                )}
              </div>
            </div>

            {/* سوابق تحصیلی */}
            <div className="bg-white border border-border rounded-3xl p-8 md:p-10 shadow-sm">
              <h2 className="text-[1.3rem] font-bold text-primary mb-8 flex items-center gap-3">
                <GraduationCap size={24} className="text-accent" />
                سوابق تحصیلی و مدارک
              </h2>

              {educations.length > 0 ? (
                <div className="space-y-8 relative before:absolute before:inset-0 before:right-5 before:w-px before:bg-border">
                  {educations.map(
                    (edu: {
                      id: string;
                      title: string;
                      organization: string;
                      startDate: string | null;
                      endDate: string | null;
                    }) => (
                      <div
                        key={edu.id}
                        className="relative flex gap-6 items-start"
                      >
                        <div className="w-10 h-10 rounded-full bg-background border-2 border-accent flex items-center justify-center shrink-0 z-10 text-accent">
                          <Award size={18} />
                        </div>
                        <div>
                          <h3 className="font-bold text-primary text-lg">
                            {edu.title}
                          </h3>
                          <p className="text-sm text-foreground-muted mt-1 mb-2">
                            {edu.organization}
                          </p>
                          {(edu.startDate || edu.endDate) && (
                            <span className="text-xs text-foreground-muted block mb-2">
                              {edu.startDate ? formatDate(edu.startDate) : ""}
                              {edu.startDate && edu.endDate ? " تا " : ""}
                              {edu.endDate ? formatDate(edu.endDate) : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-foreground-muted text-sm py-4">
                  سابقه تحصیلی ثبت نشده است.
                </p>
              )}
            </div>

            {/* رویکرد حرفه‌ای */}
            <div className="bg-gradient-to-l from-primary to-primary-light rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-lg">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/20 rounded-full blur-[40px] pointer-events-none" />
              <h2 className="text-xl font-bold mb-4 relative z-10 text-accent-light">
                رویکرد حرفه‌ای
              </h2>
              <p className="text-white/80 leading-[2] relative z-10 text-justify text-[15px]">
                «ارائه مشاوره و راهکارهای تخصصی بر پایه اصول حرفه‌ای، شفافیت و
                درک عمیق از پیچیدگی‌های حقوقی، گمرکی و تجاری.»
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
