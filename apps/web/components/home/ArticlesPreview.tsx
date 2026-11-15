import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHead } from "@/components/ui/SectionHead";
import { Button } from "@/components/ui/Button";
import { formatDate, toPersianNumber } from "@/lib/utils";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
  publishedAt: string | null;
}

interface ArticlesPreviewProps {
  articles: Article[];
}

export function ArticlesPreview({ articles }: ArticlesPreviewProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="section-padding bg-white">
      <Container>
        <SectionHead kicker="مقالات و دیدگاه‌ها" title="محتوای تخصصی" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/insights/${article.slug}`}
              className="group flex flex-col bg-white border border-border rounded-xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)] hover:-translate-y-2 hover:shadow-md hover:border-transparent"
            >
              <div className="relative aspect-[16/10] bg-gradient-to-br from-[#E8EDF3] to-[#D5DEE8] flex items-center justify-center text-[#8A97A6] text-xs overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(177,138,82,.1),transparent_50%)] z-[1]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/10" />
                <span className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md text-[10.5px] font-bold text-primary px-3 py-1 rounded-full z-[2]">
                  {article.category}
                </span>
                تصویر شاخص — نمونه
              </div>

              <div className="p-7 flex flex-col flex-1">
                <div className="flex flex-wrap gap-3.5 text-[11.5px] text-[#8A97A6] font-medium mb-3.5">
                  <span className="text-accent font-bold">
                    {article.category}
                  </span>
                  <span>{formatDate(article.publishedAt)}</span>
                  <span>{toPersianNumber(article.readTime)} دقیقه مطالعه</span>
                </div>
                <h3 className="text-[16.5px] font-bold text-primary leading-[1.7] mb-3 flex-1 transition-colors group-hover:text-primary-light">
                  {article.title}
                </h3>
                <p className="text-[13.5px] text-foreground-muted leading-[1.9] mb-4.5 line-clamp-2">
                  {article.excerpt}
                </p>
                <span className="text-[12.5px] font-bold text-accent inline-flex items-center gap-1.5 transition-all group-hover:gap-3">
                  مطالعه مقاله ←
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button href="/insights" variant="outline" size="lg">
            مشاهده همه مقالات
          </Button>
        </div>
      </Container>
    </section>
  );
}
