import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Scale, Package, Globe, Users, LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { API_URL, fetchDetail } from "@/lib/api";
import { DataErrorState } from "@/components/ui/DataErrorState";

interface Expertise {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  icon: string;
}

const iconMap: Record<string, LucideIcon> = {
  scale: Scale,
  package: Package,
  globe: Globe,
  users: Users,
};

function getExpertise(slug: string) {
  return fetchDetail<Expertise>(`${API_URL}/public/expertise/${slug}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getExpertise(slug);
  return {
    title: result.status === "ok" ? result.data.title : "حوزه تخصصی",
  };
}

export default async function ExpertiseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getExpertise(slug);

  // 👇 فقط پاسخ ۴۰۴ صفحهٔ «پیدا نشد» می‌گیرد؛ خطای سرور پیام موقت دارد
  if (result.status === "error") return <DataErrorState />;
  if (result.status === "notfound") notFound();

  const expertise = result.data;

  const Icon = iconMap[expertise.icon] || Scale;

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* ====== Header  ====== */}
      <div className="bg-primary pt-[110px] pb-16">
        <Container>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              صفحه اصلی
            </Link>
            <span>/</span>
            <Link
              href="/expertise"
              className="hover:text-white transition-colors"
            >
              حوزه‌های تخصصی
            </Link>
            <span>/</span>
            <span className="text-white/80">{expertise.title}</span>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* آیکون ساده */}
            <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center shrink-0">
              <Icon size={30} strokeWidth={1.5} />
            </div>

            <div>
              <h1 className="text-3xl md:text-3xl font-black text-white mb-3 leading-[1.3]">
                {expertise.title}
              </h1>
              <p className="text-white/70 text-base leading-[1.5] max-w-[700px]">
                {expertise.summary}
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
              معرفی و رویکرد
            </h2>
            <div className="prose prose-slate max-w-none text-foreground-muted leading-[2.2] text-justify mb-12">
              <p className="text-lg text-primary font-medium mb-6">
                {expertise.body}
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 text-orange-800 p-6 rounded-2xl text-sm leading-relaxed flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center shrink-0 text-orange-800 font-bold">
                !
              </div>
              <div>
                <strong className="block mb-1">هشدار حقوقی</strong>
                مطالب این وب‌سایت جنبه اطلاع‌رسانی عمومی دارد و جایگزین مشاوره
                حقوقی نیست.
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-28">
            <div className="bg-primary text-white rounded-3xl p-8 relative overflow-hidden shadow-lg">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
              <h3 className="text-xl font-bold mb-4 relative z-10">
                درخواست مشاوره
              </h3>
              <p className="text-white/70 text-sm leading-relaxed mb-8 relative z-10">
                برای طرح سوال در این حوزه، با ما در ارتباط باشید.
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
