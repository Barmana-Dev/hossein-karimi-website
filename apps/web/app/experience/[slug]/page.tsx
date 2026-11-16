import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, Calendar, UserRound } from "lucide-react";
import { API_URL } from "@/lib/api";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

interface Experience {
  id: string;
  slug: string;
  title: string;
  organization: string;
  category: string;
  role: string;
  startDate: string | null;
  endDate: string | null;
  description: string;
  sourceUrl: string | null;
}

const categoryLabels: Record<string, string> = {
  legal: "حقوقی",
  customs: "گمرکی",
  management: "مدیریتی",
  education: "آموزشی",
  business: "کسب‌وکار",
};

async function getExperience(slug: string): Promise<Experience | null> {
  try {
    const res = await fetch(
      `${API_URL}/public/experience/${encodeURIComponent(slug)}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const experience = await getExperience(slug);
  return {
    title: experience?.title || "سابقه حرفه‌ای",
    description: experience?.description?.slice(0, 150),
  };
}

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const experience = await getExperience(slug);

  if (!experience) notFound();

  const period = experience.startDate
    ? `${formatDate(experience.startDate)}${
        experience.endDate
          ? ` تا ${formatDate(experience.endDate)}`
          : " تا کنون"
      }`
    : null;

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* ====== Header ====== */}
      <div className="bg-primary pt-[110px] pb-16">
        <Container>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              صفحه اصلی
            </Link>
            <span>/</span>
            <Link
              href="/experience"
              className="hover:text-white transition-colors"
            >
              سوابق حرفه‌ای
            </Link>
            <span>/</span>
            <span className="text-white/80">{experience.title}</span>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center shrink-0">
              <Building2 size={30} strokeWidth={1.5} />
            </div>

            <div>
              <Badge variant="accent" className="mb-3">
                {categoryLabels[experience.category] || experience.category}
              </Badge>
              <h1 className="text-3xl font-black text-white mb-3 leading-[1.3]">
                {experience.title}
              </h1>
              <p className="text-white/70 text-base leading-[1.5] max-w-[700px]">
                {experience.organization}
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* ====== Content ====== */}
      <Container className="mt-8 relative z-20">
        <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
          <div className="bg-white border border-border rounded-3xl p-8 md:p-12 shadow-xl">
            <h2 className="text-2xl font-bold text-primary mb-8 flex items-center gap-3">
              <span className="w-2 h-6 bg-accent rounded-full inline-block"></span>
              شرح سابقه
            </h2>
            <div className="prose prose-slate max-w-none text-foreground-muted leading-[2.2] text-justify">
              <p className="text-lg text-primary font-medium mb-6">
                {experience.description}
              </p>
            </div>

            {experience.sourceUrl && (
              <a
                href={experience.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-8 text-sm font-bold text-accent hover:underline"
              >
                منبع
              </a>
            )}
          </div>

          <div className="space-y-6 lg:sticky lg:top-28">
            <div className="bg-white border border-border rounded-2xl p-6">
              <h3 className="font-bold text-primary mb-4">اطلاعات سابقه</h3>
              <ul className="space-y-4 text-sm text-foreground-muted">
                <li className="flex items-center gap-2">
                  <UserRound size={16} className="text-accent shrink-0" />
                  <span>{experience.role}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Building2 size={16} className="text-accent shrink-0" />
                  <span>{experience.organization}</span>
                </li>
                {period && (
                  <li className="flex items-center gap-2">
                    <Calendar size={16} className="text-accent shrink-0" />
                    <span>{period}</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="bg-primary text-white rounded-3xl p-8 relative overflow-hidden shadow-lg">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
              <h3 className="text-xl font-bold mb-4 relative z-10">
                درخواست مشاوره
              </h3>
              <p className="text-white/70 text-sm leading-relaxed mb-8 relative z-10">
                برای طرح سوال، با ما در ارتباط باشید.
              </p>
              <Button
                href="/contact"
                variant="accent"
                className="w-full relative z-10"
              >
                ثبت درخواست
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
