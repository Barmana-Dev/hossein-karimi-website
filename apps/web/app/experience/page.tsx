"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Building2, Loader2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHead } from "@/components/ui/SectionHead";
import { Badge } from "@/components/ui/Badge";
import { formatDate, toPersianNumber } from "@/lib/utils";
import { API_URL } from "@/lib/api";

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
}

const categoryLabels: Record<string, string> = {
  legal: "حقوقی",
  customs: "گمرکی",
  management: "مدیریتی",
  education: "آموزشی",
  business: "کسب‌وکار",
};

const ITEMS_PER_PAGE = 6;

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchExps = async () => {
      try {
        const res = await fetch(`${API_URL}/public/experience`, {
          cache: "no-store",
        });
        if (res.ok) setExperiences((await res.json()).data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExps();
  }, []);

  const totalPages = Math.ceil(experiences.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedExps = experiences.slice(
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
        <SectionHead as="h1" kicker="مسیر حرفه‌ای" title="سوابق و دستاوردها" />

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-accent" size={40} />
          </div>
        ) : paginatedExps.length > 0 ? (
          <>
            <div className="max-w-[900px] mx-auto relative">
              <div className="absolute right-[31px] top-2.5 bottom-2.5 w-0.5 bg-gradient-to-b from-accent via-accent/30 to-border hidden md:block" />
              <div className="space-y-6">
                {paginatedExps.map((exp) => (
                  // 👇 هر مورد فهرست به صفحه جزئیات همان سابقه وصل است
                  <Link
                    key={exp.id}
                    href={`/experience/${exp.slug}`}
                    className="group relative block md:pr-[90px]"
                  >
                    <div className="hidden md:flex absolute right-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border-2 border-accent z-[2] items-center justify-center shadow-[0_0_0_8px_rgba(177,138,82,.08)] transition-all duration-300 group-hover:border-primary">
                      <span className="w-2.5 h-2.5 rounded-full bg-accent transition-all duration-300 group-hover:bg-primary" />
                    </div>
                    <div className="relative bg-white border border-border rounded-2xl p-6 transition-all duration-500 group-hover:shadow-md group-hover:border-accent/40 group-hover:-translate-x-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <Badge variant="accent">
                          {categoryLabels[exp.category] || exp.category}
                        </Badge>
                        {exp.startDate && (
                          <span className="text-xs font-medium text-foreground-muted flex items-center gap-1.5">
                            <Calendar size={12} className="text-accent" />{" "}
                            {formatDate(exp.startDate)}
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-primary mb-2 group-hover:text-accent transition-colors">
                        {exp.title}
                      </h2>
                      <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                        <Building2 size={14} className="text-accent" />{" "}
                        {exp.organization}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
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
            <p className="text-foreground-muted">سابقه‌ای یافت نشد.</p>
          </div>
        )}
      </Container>
    </div>
  );
}
