"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHead } from "@/components/ui/SectionHead";
import { Badge } from "@/components/ui/Badge";
import { Loader2, ArrowLeft } from "lucide-react";
import { toPersianNumber } from "@/lib/utils";
import { API_URL, safeExternalUrl } from "@/lib/api";
import { LoadError } from "@/components/ui/LoadError";

interface MediaItem {
  id: string;
  type: string;
  title: string;
  description: string | null;
  sourceUrl: string | null;
  happenedAt: string | null;
}
const ITEMS_PER_PAGE = 6;

export default function MediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;
    const fetchMedia = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`${API_URL}/public/media`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("failed");
        const json = await res.json();
        if (isMounted) setMediaList(json.data ?? []);
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setLoadError(
            "دریافت اخبار و رویدادها از سرور انجام نشد. لطفاً دوباره تلاش کنید.",
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchMedia();
    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const totalPages = Math.ceil(mediaList.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMedia = mediaList.slice(
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
        <SectionHead as="h1" kicker="رسانه" title="اخبار، مصاحبه‌ها و رویدادها" />
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-accent" size={40} />
          </div>
        ) : loadError ? (
          <LoadError
            message={loadError}
            onRetry={() => setReloadKey((key) => key + 1)}
          />
        ) : paginatedMedia.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1200px] mx-auto">
              {paginatedMedia.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <Badge variant="accent" className="mb-4 w-fit">
                    {item.type}
                  </Badge>
                  <h2 className="text-lg font-bold text-primary mb-3">
                    {item.title}
                  </h2>
                  <p className="text-sm text-foreground-muted leading-relaxed mb-6 line-clamp-3 flex-1">
                    {item.description}
                  </p>
                  {safeExternalUrl(item.sourceUrl) && (
                    <a
                      href={safeExternalUrl(item.sourceUrl) ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-accent hover:underline inline-flex items-center gap-1 mt-auto"
                    >
                      مشاهده منبع اصلی <ArrowLeft size={14} />
                    </a>
                  )}
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="shrink-0 px-4 py-2 rounded-lg border border-border bg-white text-sm font-bold text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background transition-colors"
                >
                  قبلی
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      aria-label={`صفحهٔ ${toPersianNumber(page)}`}
                      aria-current={currentPage === page ? "page" : undefined}
                      className={`shrink-0 min-w-10 h-10 px-2 rounded-lg text-sm font-bold transition-colors ${currentPage === page ? "bg-primary text-white" : "bg-white border border-border text-primary hover:bg-background"}`}
                    >
                      {toPersianNumber(page)}
                    </button>
                  ),
                )}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="shrink-0 px-4 py-2 rounded-lg border border-border bg-white text-sm font-bold text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background transition-colors"
                >
                  بعدی
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white border border-border rounded-2xl">
            <p className="text-foreground-muted">
              مورد رسانه‌ای برای نمایش وجود ندارد.
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}
