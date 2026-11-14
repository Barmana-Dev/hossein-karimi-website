import Link from "next/link";
import {
  Scale,
  Package,
  Globe,
  Users,
  ArrowLeft,
  LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHead } from "@/components/ui/SectionHead";

const iconMap: Record<string, LucideIcon> = {
  scale: Scale,
  package: Package,
  globe: Globe,
  users: Users,
};

interface Expertise {
  id: string;
  title: string;
  slug: string;
  summary: string;
  icon: string;
}

interface ExpertiseCardsProps {
  expertises: Expertise[];
}

export function ExpertiseCards({ expertises }: ExpertiseCardsProps) {
  if (!expertises || expertises.length === 0) return null;

  return (
    <section className="section-padding bg-white">
      <Container>
        <SectionHead kicker="حوزه‌های تخصصی" title="زمینه‌های فعالیت حرفه‌ای" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {expertises.map((item, i) => {
            const Icon = iconMap[item.icon] || Scale;
            return (
              <Link
                key={item.id}
                href={`/expertise/${item.slug}`}
                className="group relative bg-white border border-border rounded-2xl p-8 flex flex-col overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(15,30,51,.1)] hover:border-accent/40"
              >
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-accent to-accent-light origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-500 z-30" />
                </div>
                <span className="absolute top-6 left-6 text-[44px] font-black text-primary/[.03] leading-none select-none pointer-events-none group-hover:text-accent/[.06] transition-colors duration-500">
                  0{i + 1}
                </span>

                <div className="w-14 h-14 rounded-xl bg-primary/5 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-accent-light transition-all duration-500 relative z-10">
                  <Icon size={26} strokeWidth={1.7} />
                </div>
                <h3 className="text-[17px] font-bold text-primary mb-3 relative z-10 group-hover:text-accent transition-colors">
                  {item.title}
                </h3>
                <p className="text-[13.5px] text-foreground-muted leading-[1.9] mb-6 flex-1 relative z-10 line-clamp-3">
                  {item.summary}
                </p>
                <span className="text-[12.5px] font-bold text-accent inline-flex items-center gap-1.5 transition-all duration-300 group-hover:gap-3 relative z-10">
                  جزئیات <ArrowLeft size={14} />
                </span>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
