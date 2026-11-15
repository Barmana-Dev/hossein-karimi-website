import Link from "next/link";
import { Calendar, Building2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHead } from "@/components/ui/SectionHead";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

// 👇 نقشه‌ی تبدیل دسته‌بندی انگلیسی به فارسی
const categoryLabels: Record<string, string> = {
  customs: "امور گمرکی",
  business: "کسب‌وکار",
  management: "مدیریت",
  legal: "حقوقی",
  education: "آموزشی",
};

interface Experience {
  id: string;
  slug: string;
  title: string;
  organization: string;
  category: string;
  startDate: string | null;
  endDate: string | null;
}

interface TimelinePreviewProps {
  experiences: Experience[];
}

export function TimelinePreview({ experiences }: TimelinePreviewProps) {
  if (!experiences || experiences.length === 0) return null;

  const recentExperiences = experiences.slice(0, 3);

  return (
    <section className="section-padding bg-background">
      <Container>
        <SectionHead kicker="مسیر حرفه‌ای" title="سوابق و دستاوردها" />

        <div className="max-w-[900px] mx-auto relative">
          <div className="absolute right-[31px] top-2.5 bottom-2.5 w-0.5 bg-gradient-to-b from-accent via-accent/30 to-border hidden md:block" />

          <div className="space-y-6">
            {recentExperiences.map((exp) => (
              // 👇 Link برگشت (hover و استایل مثل قبل)
              <div key={exp.id} className="group relative block md:pr-[90px]">
                <div className="hidden md:flex absolute right-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border-2 border-accent z-[2] items-center justify-center shadow-[0_0_0_8px_rgba(177,138,82,.08)] transition-all duration-300 group-hover:border-primary">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent transition-all duration-300 group-hover:bg-primary" />
                </div>

                <div className="relative bg-white border border-border rounded-2xl p-6 transition-all duration-500 group-hover:shadow-md group-hover:border-accent/40 group-hover:-translate-x-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    {/* 👇 دسته‌بندی فارسی */}
                    <Badge variant="accent">
                      {categoryLabels[exp.category] || exp.category}
                    </Badge>
                    {/* 👇 تاریخ فقط اگه وجود داشت */}
                    {exp.startDate && (
                      <span className="text-xs font-medium text-foreground-muted flex items-center gap-1.5">
                        <Calendar size={12} className="text-accent" />
                        {formatDate(exp.startDate)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-2 group-hover:text-accent transition-colors">
                    {exp.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                      <Building2 size={14} className="text-accent" />{" "}
                      {exp.organization}
                    </div>
                    {/* 👇 فلش رفتن به جزئیات حذف شد */}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/experience"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-accent transition-colors"
            >
              مشاهده تمام سوابق
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
