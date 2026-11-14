"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Search,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { toPersianNumber } from "@/lib/utils";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
  coverImage: string | null;
  publishedAt: string | null;
}

const ITEMS_PER_PAGE = 6;

export default function InsightsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("همه مقالات");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/api/v1/public/articles`,
          { cache: "no-store" },
        );
        if (res.ok) setArticles((await res.json()).data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      activeCategory === "همه مقالات" || article.category === activeCategory;
    const matchesSearch = article.title.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedArticles = filteredArticles.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );
  const categories = [
    "همه مقالات",
    ...Array.from(new Set(articles.map((a) => a.category))),
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="pt-[100px] pb-24 bg-background min-h-screen">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 pb-8 border-b border-border pt-7">
          <div className="max-w-[600px]">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-accent bg-accent/10 px-4 py-1.5 rounded-full mb-4 tracking-wider">
              دانش‌نامه تخصصی
            </span>
            <h1 className="text-3xl md:text-3xl font-black text-primary mb-4">
              مقالات و تحلیل‌ها
            </h1>
          </div>
          <div className="w-full md:w-[320px] relative group">
            <input
              type="text"
              placeholder="جستجو در مقالات..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-border rounded-2xl py-3 pr-12 pl-4 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-sm"
            />
            <Search
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted group-focus-within:text-accent transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-10 scrollbar-hide">
          <div className="flex items-center gap-2 text-sm font-bold text-primary ml-2 shrink-0">
            <SlidersHorizontal size={16} className="text-accent" />{" "}
            دسته‌بندی‌ها:
          </div>
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentPage(1);
              }}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeCategory === cat ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-white text-foreground-muted border border-border hover:border-accent/50 hover:text-primary"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-accent" size={40} />
          </div>
        ) : paginatedArticles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedArticles.map((article) => (
                <div
                  key={article.id}
                  className="group relative flex flex-col bg-white border border-border rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(15,30,51,.1)] hover:border-accent/30"
                >
                  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-accent to-accent-light origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-500 z-30" />
                  </div>
                  <Link
                    href={`/insights/${article.slug}`}
                    className="relative block aspect-[16/10] bg-gradient-to-br from-[#E8EDF3] to-[#D5DEE8] overflow-hidden rounded-t-2xl"
                  >
                    {article.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          article.coverImage.startsWith("http")
                            ? article.coverImage
                            : `http://localhost:4000${article.coverImage}`
                        }
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <>
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md text-primary text-[11px] font-bold px-3 py-1.5 rounded-full z-20 shadow-sm border border-white/50">
                          {article.category}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center text-[#8A97A6] text-xs">
                          تصویر شاخص
                        </div>
                      </>
                    )}
                  </Link>
                  <div className="p-6 md:p-8 flex flex-col flex-1">
                    <Link
                      href={`/insights/${article.slug}`}
                      className="block group-hover:-translate-y-1 transition-transform duration-300"
                    >
                      <h3 className="text-lg font-bold text-primary leading-[1.6] mb-4 line-clamp-2 transition-colors group-hover:text-accent">
                        {article.title}
                      </h3>
                      <p className="text-sm text-foreground-muted leading-relaxed mb-6 line-clamp-2">
                        {article.excerpt}
                      </p>
                    </Link>
                    <div className="flex items-center justify-between pt-5 border-t border-border mt-auto">
                      <span className="text-xs font-medium text-foreground-muted flex items-center gap-1.5 bg-background px-2.5 py-1 rounded-md border border-border">
                        <Clock size={12} className="text-accent" />
                        {toPersianNumber(article.readTime)} دقیقه
                      </span>
                      <Link
                        href={`/insights/${article.slug}`}
                        className="relative inline-flex items-center justify-center overflow-hidden px-4 py-2 rounded-lg text-xs font-bold text-accent bg-accent/10 transition-all duration-300 active:scale-95"
                      >
                        <span className="absolute inset-0 bg-accent -translate-x-[120%] transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-x-0 z-[1]" />
                        <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors duration-300 group-hover:translate-x-1">
                          مطالعه <ArrowLeft size={14} />
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
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
            <p className="text-foreground-muted">
              مقاله‌ای با این مشخصات یافت نشد.
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}
