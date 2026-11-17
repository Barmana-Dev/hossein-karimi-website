"use client";

import { useState, useEffect } from "react";
import { toPersianNumber } from "@/lib/utils";
import Link from "next/link";
import { API_URL } from "@/lib/api";
import { SmartImage } from "@/components/ui/SmartImage";
import {
  ArrowLeft,
  Search,
  Building2,
  MapPin,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Container } from "@/components/ui/Container";

interface Agency {
  id: string;
  slug: string;
  name: string;
  description: string;
  field: string;
  relationType: string;
  city: string | null;
  logoImage: string | null;
}

interface NetworkHeader {
  kicker: string;
  title: string;
  description: string;
}

const ITEMS_PER_PAGE = 6;

export default function NetworkIndexPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("همه مجموعه‌ها");
  const [currentPage, setCurrentPage] = useState(1);

  // 👇 هدر داینامیک از API تنظیمات
  const [header, setHeader] = useState<NetworkHeader>({
    kicker: "شبکه حرفه‌ای",
    title: "کارگزاری‌ها و مجموعه‌ها",
    description:
      "شبکه‌ای از مجموعه‌ها و کارگزاری‌های مرتبط با فعالیت‌های حرفه‌ای.",
  });

  useEffect(() => {
    let isMounted = true;

    const fetchHeader = async () => {
      try {
        const res = await fetch(`${API_URL}/public/settings`, {
          cache: "no-store",
        });
        if (res.ok && isMounted) {
          const json = await res.json();
          const d = json.data;
          setHeader({
            kicker: d.networkKicker || "شبکه حرفه‌ای",
            title: d.networkTitle || "کارگزاری‌ها و مجموعه‌ها",
            description: "",
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    const fetchAgencies = async () => {
      try {
        const res = await fetch(`${API_URL}/public/network`, {
          cache: "no-store",
        });
        if (res.ok && isMounted) {
          const json = await res.json();
          setAgencies(json.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // 👇 هر دو fetch موازی
    Promise.all([fetchHeader(), fetchAgencies()]);

    return () => {
      isMounted = false;
    };
  }, []);

  // فیلتر
  const filteredAgencies = agencies.filter((agency) => {
    const matchesCategory =
      activeCategory === "همه مجموعه‌ها" || agency.field === activeCategory;
    const matchesSearch =
      agency.name.includes(searchTerm) ||
      agency.description.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredAgencies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAgencies = filteredAgencies.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const categories = [
    "همه مجموعه‌ها",
    ...Array.from(new Set(agencies.map((a) => a.field))),
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="pt-[120px] pb-24 bg-background min-h-screen relative overflow-hidden">
      {/* پس‌زمینه */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #B18A52 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse 60% 80% at 50% 30%, #000 10%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 80% at 50% 30%, #000 10%, transparent 70%)",
        }}
      />

      <Container className="relative z-10">
        {/* ====== هدر داینامیک  ====== */}
        <div className="mb-10 pb-8 border-b border-border">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-[640px]">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold text-accent bg-accent/10 px-3 py-1 rounded-full mb-4 tracking-wider border border-accent/20">
                {header.kicker}
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-primary mb-3 leading-[1.3]">
                {header.title}
              </h1>
              <p className="text-sm text-foreground-muted leading-[1.9] max-w-[560px]">
                {header.description}
              </p>
            </div>

            {/* جستجو */}
            <div className="w-full md:w-[300px] relative group shrink-0">
              <input
                type="text"
                placeholder="جستجوی مجموعه..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-border rounded-xl py-2.5 pr-11 pl-4 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
              <Search
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted group-focus-within:text-accent transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ====== فیلتر دسته‌بندی ====== */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground-muted ml-2 shrink-0">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent"
            >
              <line x1="21" y1="4" x2="14" y2="4"></line>
              <line x1="10" y1="4" x2="3" y2="4"></line>
              <line x1="21" y1="12" x2="12" y2="12"></line>
              <line x1="8" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="20" x2="16" y2="20"></line>
              <line x1="12" y1="20" x2="3" y2="20"></line>
              <line x1="14" y1="2" x2="14" y2="6"></line>
              <line x1="8" y1="10" x2="8" y2="14"></line>
              <line x1="16" y1="18" x2="16" y2="22"></line>
            </svg>
            دسته‌بندی:
          </div>
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentPage(1);
              }}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? "bg-primary text-white"
                  : "bg-white text-foreground-muted border border-border hover:border-accent/50 hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ====== Grid ====== */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-accent" size={40} />
          </div>
        ) : paginatedAgencies.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedAgencies.map((agency) => (
                <div
                  key={agency.id}
                  className="group relative flex flex-col bg-white border border-border rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(15,30,51,.1)] hover:border-accent/40"
                >
                  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-accent to-accent-light origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-500 z-30" />
                  </div>

                  <div className="flex items-start justify-between mb-5">
                    <div className="relative w-12 h-12 rounded-xl bg-background text-primary flex items-center justify-center font-black text-lg border border-border group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all duration-500 overflow-hidden">
                      {agency.logoImage ? (
                        <SmartImage
                          src={agency.logoImage}
                          alt={agency.name}
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        agency.name.charAt(0)
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-background text-foreground-muted border border-border group-hover:border-accent/30 transition-colors">
                      <ShieldCheck size={11} className="text-accent" />
                      {agency.relationType}
                    </span>
                  </div>

                  <Link
                    href={`/network/${agency.slug}`}
                    className="block group-hover:-translate-y-0.5 transition-transform duration-300"
                  >
                    <h2 className="text-lg font-bold text-primary mb-2 transition-colors group-hover:text-accent">
                      {agency.name}
                    </h2>
                    <p className="text-xs text-foreground-muted leading-[1.8] mb-5 line-clamp-2">
                      {agency.description}
                    </p>
                  </Link>

                  <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                    <div className="flex items-center gap-3 text-[11px] text-foreground-muted font-medium">
                      <span className="flex items-center gap-1">
                        <Building2 size={12} className="text-accent" />
                        {agency.field}
                      </span>
                      {agency.city && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-accent" />
                          {agency.city}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/network/${agency.slug}`}
                      className="relative inline-flex items-center justify-center overflow-hidden px-3 py-1.5 rounded-lg text-[11px] font-bold text-accent bg-accent/10 transition-all duration-300 active:scale-95 group/btn"
                    >
                      <span className="absolute inset-0 bg-accent -translate-x-[120%] transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-x-0" />
                      <span className="relative z-10 flex items-center gap-1.5 group-hover:text-white transition-colors duration-300">
                        مشاهده <ArrowLeft size={12} />
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* صفحه‌بندی */}
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
                      className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                        currentPage === page
                          ? "bg-primary text-white"
                          : "bg-white border border-border text-primary hover:bg-background"
                      }`}
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
            <p className="text-foreground-muted">
              مجموعه‌ای با این مشخصات یافت نشد.
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}
