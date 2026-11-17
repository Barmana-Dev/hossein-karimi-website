import { toPersianNumber } from "@/lib/utils";

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

// حداکثر تعداد شماره‌صفحه‌های نمایش‌داده‌شده (با … برای بقیه)
const MAX_VISIBLE = 7;

function visiblePages(page: number, totalPages: number): number[] {
  if (totalPages <= MAX_VISIBLE) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const start = Math.max(1, Math.min(page - 3, totalPages - MAX_VISIBLE + 1));
  return Array.from({ length: MAX_VISIBLE }, (_, i) => start + i);
}

export function AdminPagination({
  page,
  totalPages,
  onChange,
}: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = visiblePages(page, totalPages);

  const go = (nextPage: number) => {
    onChange(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav
      aria-label="صفحه‌بندی"
      className="flex flex-wrap justify-center items-center gap-2 mt-6"
    >
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page === 1}
        className="px-4 py-2 rounded-lg border border-border bg-white text-sm font-bold text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background transition-colors"
      >
        قبلی
      </button>

      {pages[0] > 1 && <span className="px-1 text-foreground-muted">…</span>}

      {pages.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => go(item)}
          aria-current={item === page ? "page" : undefined}
          className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
            item === page
              ? "bg-primary text-white"
              : "bg-white border border-border text-primary hover:bg-background"
          }`}
        >
          {toPersianNumber(item)}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <span className="px-1 text-foreground-muted">…</span>
      )}

      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page === totalPages}
        className="px-4 py-2 rounded-lg border border-border bg-white text-sm font-bold text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background transition-colors"
      >
        بعدی
      </button>
    </nav>
  );
}
