"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHead } from "@/components/ui/SectionHead";
import { Badge } from "@/components/ui/Badge";
import { Loader2, ArrowLeft } from "lucide-react";
import { toPersianNumber } from "@/lib/utils";

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
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;
    const fetchMedia = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/v1/public/media`, {
          cache: "no-store",
        });
        if (res.ok && isMounted) setMediaList((await res.json()).data);
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchMedia();
    return () => {
      isMounted = false;
    };
  }, []);

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
        <SectionHead kicker="رسانه" title="اخبار، مصاحبه‌ها و رویدادها" />
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-accent" size={40} />
          </div>
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
                  <h3 className="text-lg font-bold text-primary mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-foreground-muted leading-relaxed mb-6 line-clamp-3 flex-1">
                    {item.description}
                  </p>
                  {item.sourceUrl && (
                    <a
                      href={item.sourceUrl}
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
              مورد رسانه‌ای برای نمایش وجود ندارد.
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}
