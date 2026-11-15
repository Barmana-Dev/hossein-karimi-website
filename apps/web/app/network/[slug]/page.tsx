import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Building2, Link as LinkIcon, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { API_URL, assetUrl } from "@/lib/api";

// export const instant = false;

interface Agency {
  id: string;
  slug: string;
  name: string;
  description: string;
  field: string;
  relationType: string;
  relationDescription: string | null;
  city: string | null;
  websiteUrl: string | null;
  logoImage: string | null;
}

async function getAgency(slug: string): Promise<Agency | null> {
  try {
    const res = await fetch(`${API_URL}/public/network/${slug}`, {
      cache: "no-store",
    });
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
  const agency = await getAgency(slug);
  return { title: agency?.name || "مجموعه مرتبط" };
}

export default async function AgencyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agency = await getAgency(slug);

  if (!agency) notFound();

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* ====== Header مینیمال ====== */}
      <div className="bg-primary pt-[120px] pb-16">
        <Container>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/40 mb-8">
            <Link href="/" className="hover:text-white transition-colors">
              صفحه اصلی
            </Link>
            <span>/</span>
            <Link
              href="/network"
              className="hover:text-white transition-colors"
            >
              شبکه کارگزاری‌ها
            </Link>
            <span>/</span>
            <span className="text-white/80">{agency.name}</span>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            {/* لوگو ساده */}
            <div className="w-24 h-24 rounded-2xl bg-white/5 text-white flex items-center justify-center font-black text-4xl border border-white/10 shrink-0 overflow-hidden">
              {agency.logoImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={assetUrl(agency.logoImage)}
                  alt={agency.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                agency.name.charAt(0)
              )}
            </div>

            <div className="text-center md:text-right flex-1">
              <h1 className="text-3xl md:text-3xl font-black text-white mb-3">
                {agency.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-white/60">
                <span>{agency.field}</span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={14} /> {agency.relationType}
                </span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* ====== Content ====== */}
      <Container className="mt-12 relative z-20">
        <div className="grid lg:grid-cols-[1.8fr_1fr] gap-8">
          <div className="bg-white border border-border rounded-3xl p-8 md:p-12 shadow-sm">
            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
              <span className="w-2 h-6 bg-accent rounded-full inline-block"></span>
              درباره مجموعه
            </h2>
            <div className="prose prose-slate max-w-none text-foreground-muted leading-[2] text-justify">
              <p>{agency.description}</p>
              <div className="mt-8 p-6 bg-background rounded-2xl border border-border">
                <h3 className="text-lg font-bold text-primary mb-3">
                  نوع ارتباط با دکتر کریمی
                </h3>
                <p className="text-sm">
                  {agency.relationDescription ||
                    "اطلاعات تکمیلی پس از تأیید درج خواهد شد."}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
              <h3 className="font-bold text-primary mb-6 text-lg">
                اطلاعات تکمیلی
              </h3>
              <ul className="space-y-5">
                <li className="flex items-center gap-4 text-sm">
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-accent shrink-0">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <span className="block text-[11px] text-foreground-muted mb-0.5">
                      حوزه فعالیت
                    </span>
                    <span className="font-bold text-primary">
                      {agency.field}
                    </span>
                  </div>
                </li>
                {agency.city && (
                  <li className="flex items-center gap-4 text-sm">
                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-accent shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <span className="block text-[11px] text-foreground-muted mb-0.5">
                        شهر
                      </span>
                      <span className="font-bold text-primary">
                        {agency.city}
                      </span>
                    </div>
                  </li>
                )}
              </ul>

              {agency.websiteUrl && (
                <div className="mt-8 pt-6 border-t border-border">
                  <a
                    href={agency.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-light transition-colors"
                  >
                    <LinkIcon size={16} /> مشاهده وب‌سایت رسمی
                  </a>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-accent to-accent-dark rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <h3 className="text-lg font-bold mb-3 relative z-10">
                نیاز به اطلاعات بیشتر دارید؟
              </h3>
              <p className="text-white/80 text-sm leading-relaxed mb-6 relative z-10">
                برای کسب اطلاعات بیشتر درباره این مجموعه یا نحوه همکاری، با ما
                در ارتباط باشید.
              </p>
              <Button
                href="/contact"
                variant="outline"
                className="w-full border-white/40 text-white hover:bg-white/20 relative z-10"
              >
                درخواست ارتباط
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
