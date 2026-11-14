import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHead } from "@/components/ui/SectionHead";
import { Button } from "@/components/ui/Button";

interface Agency {
  id: string;
  slug: string;
  name: string;
  description: string;
  relationType: string;
  field: string;
}

interface NetworkPreviewProps {
  agencies: Agency[];
}

export function NetworkPreview({ agencies }: NetworkPreviewProps) {
  if (!agencies || agencies.length === 0) return null;

  return (
    <section className="section-padding relative overflow-hidden bg-gradient-to-br from-primary to-primary-light text-white">
      {/* grid overlay */}
      <div
        className="absolute inset-0 bg-grid-pattern bg-[length:80px_80px] opacity-100"
        style={{
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, #000 10%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, #000 10%, transparent 80%)",
        }}
      />

      <Container className="relative z-[2]">
        <SectionHead
          variant="dark"
          kicker="شبکه حرفه‌ای"
          title="کارگزاری‌ها و مجموعه‌های مرتبط"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {agencies.map((agency) => (
            <Link
              key={agency.id}
              href={`/network/${agency.slug}`}
              className="group relative rounded-xl p-8 flex flex-col gap-5 overflow-hidden bg-white/[.04] border border-white/10 backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)] hover:bg-white/[.07] hover:border-accent/35 hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(0,0,0,.3)]"
            >
              {/* top line */}
              <span className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-l from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* glow */}
              <span className="absolute w-56 h-56 rounded-full bg-[radial-gradient(circle,rgba(177,138,82,.18),transparent_65%)] -bottom-24 -left-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-[1] flex items-center justify-between">
                <div className="w-[62px] h-[62px] rounded-[18px] bg-gradient-to-br from-accent/25 to-accent/10 text-accent-light flex items-center justify-center font-extrabold text-[22px] border border-accent/30 transition-all duration-500 group-hover:scale-[1.06] group-hover:-rotate-3 group-hover:from-accent/40 group-hover:to-accent/15 group-hover:shadow-[0_8px_24px_rgba(177,138,82,.25)]">
                  {agency.name.charAt(0)}
                </div>
                <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold px-3 py-1 rounded-full bg-accent-light/10 text-accent-light border border-accent-light/25">
                  <span className="w-1 h-1 rounded-full bg-accent-light animate-pulse" />
                  {agency.relationType}
                </span>
              </div>

              <h3 className="text-[16.5px] font-bold text-white relative z-[1]">
                {agency.name}
              </h3>
              <p className="text-[13.5px] text-white/60 flex-1 leading-[1.9] relative z-[1] line-clamp-2">
                {agency.description}
              </p>
              <span className="text-[12.5px] font-bold text-accent-light inline-flex items-center gap-1.5 transition-all group-hover:gap-3 relative z-[1]">
                مشاهده جزئیات ←
              </span>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            href="/network"
            variant="ghost"
            size="lg"
            className="border-accent/40 text-accent-light hover:bg-accent/15"
          >
            مشاهده همه مجموعه‌ها
          </Button>
        </div>
      </Container>
    </section>
  );
}
