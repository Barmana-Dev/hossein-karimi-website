"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/api";
import {
  Scale,
  Package,
  Globe,
  Users,
  ArrowLeft,
  Loader2,
  LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHead } from "@/components/ui/SectionHead";
import { toPersianNumber } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  scale: Scale,
  package: Package,
  globe: Globe,
  users: Users,
};
const ITEMS_PER_PAGE = 6;

interface Expertise {
  id: string;
  slug: string;
  title: string;
  summary: string;
  icon: string;
}

export default function ExpertiseIndexPage() {
  const [expertises, setExpertises] = useState<Expertise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchExpertises = async () => {
      try {
        const res = await fetch(`${API_URL}/public/expertise`, {
          cache: "no-store",
        });
        if (res.ok) setExpertises((await res.json()).data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExpertises();
  }, []);

  const totalPages = Math.ceil(expertises.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedExpertises = expertises.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="pt-[120px] pb-24 bg-background min-h-screen">
      <Container>
        <SectionHead kicker="حوزه‌های تخصصی" title="زمینه‌های فعالیت حرفه‌ای" />

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-accent" size={40} />
          </div>
        ) : paginatedExpertises.length > 0 ? (
          <>
            {/* 👇 gap و max-w کمی کمتر */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[960px] mx-auto">
              {paginatedExpertises.map((item, index) => {
                const Icon = iconMap[item.icon] || Scale;
                return (
                  <div
                    key={item.id}
                    className="group relative flex flex-col bg-white border border-border rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(15,30,51,.1)] hover:border-accent/30 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-accent to-accent-light origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-500 z-30" />
                    {/* 👇 شماره پس‌زمینه کوچیک‌تر */}
                    <span className="absolute top-5 left-6 text-[70px] font-black text-primary/[.03] leading-none select-none pointer-events-none group-hover:text-accent/[.06] transition-colors duration-500">
                      0{startIndex + index + 1}
                    </span>
                    <div className="relative z-10 flex flex-col h-full">
                      {/* 👇 آیکون کوچیک‌تر */}
                      <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-accent-light transition-all duration-500 shrink-0">
                        <Icon size={24} strokeWidth={1.5} />
                      </div>
                      {/* 👇 تیتر کوچیک‌تر */}
                      <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-accent transition-colors">
                        {item.title}
                      </h3>
                      {/* 👇 متن کوچیک‌تر */}
                      <p className="text-sm text-foreground-muted leading-[1.9] mb-6 flex-1">
                        {item.summary}
                      </p>
                      <div className="mt-auto pt-5 border-t border-border flex items-center justify-between">
                        <Link
                          href={`/expertise/${item.slug}`}
                          className="relative inline-flex items-center justify-center overflow-hidden px-5 py-2.5 rounded-lg text-[13px] font-bold bg-primary text-white transition-all duration-300 active:scale-95 group/btn w-full sm:w-auto"
                        >
                          <span className="absolute inset-0 bg-primary-light -translate-x-[120%] transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/btn:translate-x-0 z-[1]" />
                          <span className="relative z-10 flex items-center gap-2 group-hover/btn:translate-x-1 justify-center">
                            مشاهده جزئیات <ArrowLeft size={14} />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-border bg-white text-sm font-bold text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background transition-colors"
                >
                  قبلی
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${currentPage === page ? "bg-primary text-white" : "bg-white border border-border text-primary hover:bg-background"}`}
                    >
                      {toPersianNumber(page)}
                    </button>
                  ),
                )}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-border bg-white text-sm font-bold text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background transition-colors"
                >
                  بعدی
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white border border-border rounded-2xl">
            <p className="text-foreground-muted">حوزه‌ای یافت نشد.</p>
          </div>
        )}
      </Container>
    </div>
  );
}
