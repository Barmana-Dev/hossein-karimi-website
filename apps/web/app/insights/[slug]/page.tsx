import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { API_URL, SITE_URL, assetUrl, fetchDetail } from "@/lib/api";
import { SmartImage } from "@/components/ui/SmartImage";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { ArrowRight, Clock, Calendar, User, BookOpen } from "lucide-react";
import { ArticleShareButton } from "@/components/ArticleShareButton";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { DataErrorState } from "@/components/ui/DataErrorState";
import { toPersianNumber, formatDate } from "@/lib/utils";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  authorName: string;
  category: string;
  readTime: number;
  publishedAt: string;
  coverImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

interface RelatedArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
}

interface TocHeading {
  id: string;
  text: string;
  level: number;
}

// 👇 فهرست مطالب از headingهای واقعی محتوا ساخته می‌شود و شناسهٔ لینک‌پذیر می‌گیرد
function buildTableOfContents(html: string): {
  html: string;
  headings: TocHeading[];
} {
  const headings: TocHeading[] = [];
  let index = 0;

  const withIds = html.replace(
    /<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, tag: string, attrs: string, inner: string) => {
      index += 1;
      const id = `section-${index}`;
      const text = inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (!text) return match;

      headings.push({
        id,
        text,
        level: tag.toLowerCase() === "h2" ? 2 : 3,
      });

      const cleanAttrs = attrs.replace(/\s+id=("[^"]*"|'[^']*')/gi, "");
      return `<${tag}${cleanAttrs} id="${id}">${inner}</${tag}>`;
    },
  );

  return { html: withIds, headings };
}

// 👇 بدون کش، تا تغییر تصویر شاخص بلافاصله بعد از ذخیره دیده شود
function getArticle(slug: string) {
  return fetchDetail<Article>(`${API_URL}/public/articles/${slug}`);
}

async function getRelatedArticles(
  currentSlug: string,
): Promise<RelatedArticle[]> {
  try {
    const res = await fetch(`${API_URL}/public/articles`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    const all: Article[] = json.data || [];

    return all
      .filter((a) => a.slug !== currentSlug)
      .slice(0, 2)
      .map((a) => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        category: a.category,
      }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getArticle(slug);

  if (result.status !== "ok") {
    return { title: "مقاله", robots: { index: false } };
  }

  const article = result.data;
  const card = article as typeof article & {
    publishedAt?: string | null;
    updatedAt?: string | null;
  };
  const url = `${SITE_URL}/insights/${slug}`;
  const image = article.coverImage
    ? assetUrl(article.coverImage)
    : `${SITE_URL}/og-default.png`;

  const metaTitle = article.metaTitle || article.title;
  const metaDescription = article.metaDescription || article.excerpt;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: metaTitle,
      description: metaDescription,
      url,
      siteName: "حسین کریمی",
      locale: "fa_IR",
      images: [{ url: image, width: 1200, height: 630, alt: article.title }],
      publishedTime: card.publishedAt ?? undefined,
      modifiedTime: card.updatedAt ?? card.publishedAt ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [image],
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [articleResult, relatedArticles] = await Promise.all([
    getArticle(slug),
    getRelatedArticles(slug),
  ]);

  // 👇 فقط پاسخ ۴۰۴ صفحهٔ «پیدا نشد» می‌گیرد؛ خطای سرور پیام موقت دارد
  if (articleResult.status === "error") return <DataErrorState />;
  if (articleResult.status === "notfound") notFound();

  const article = articleResult.data;
  const { html: articleBody, headings } = buildTableOfContents(
    sanitizeHtml(article.body),
  );

  return (
    <div className="pt-[100px] pb-24 bg-background min-h-screen">
      <Container>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-foreground-muted mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            صفحه اصلی
          </Link>
          <span>/</span>
          <Link
            href="/insights"
            className="hover:text-primary transition-colors"
          >
            مقالات
          </Link>
          <span>/</span>
          <span className="text-primary font-semibold truncate max-w-[200px] md:max-w-xs">
            {article.title}
          </span>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-12 lg:gap-16 items-start">
          {/* Main Content */}
          <div className="bg-white border border-border rounded-3xl p-8 md:p-12 shadow-sm relative">
            <div className="absolute top-0 right-10 left-10 h-1 bg-gradient-to-l from-transparent via-accent to-transparent opacity-50 rounded-b-full" />

            {/* Header */}
            <div className="mb-10 text-center md:text-right">
              <Badge variant="accent" className="mb-6">
                {article.category}
              </Badge>
              <h1 className="text-2xl md:text-2xl lg:text-3xl font-black text-primary leading-[1.4] mb-6">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-foreground-muted">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-accent" />
                  <span className="font-semibold text-primary">
                    {article.authorName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-accent" />
                  <span>{formatDate(article.publishedAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-accent" />
                  <span>{toPersianNumber(article.readTime)} دقیقه مطالعه</span>
                </div>
              </div>
            </div>

            {article.coverImage ? (
              <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden mb-12 border border-border relative bg-gray-100">
                <SmartImage
                  src={article.coverImage}
                  alt={article.title}
                  priority
                  sizes="(max-width: 1024px) 100vw, 900px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-[#E8EDF3] to-[#D5DEE8] mb-12 flex items-center justify-center text-[#8A97A6] text-sm border border-border relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5" />
                <span className="relative z-10">تصویر شاخص مقاله</span>
              </div>
            )}

            {/* Content */}
            <div className="prose prose-slate prose-lg max-w-none text-foreground-muted leading-[2.2] text-justify">
              <p className="text-xl text-primary font-semibold mb-8 leading-[1.8]">
                {article.excerpt}
              </p>
              <div dangerouslySetInnerHTML={{ __html: articleBody }} />
            </div>

            {/* Actions */}
            <div className="mt-10 pt-8 border-t border-border flex items-center justify-between">
              <span className="text-sm font-bold text-primary">
                اشتراک‌گذاری:
              </span>
              <div className="flex gap-2">
                <ArticleShareButton title={article.title} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8 sticky top-28">
            {headings.length > 0 && (
              <div className="bg-white border border-border rounded-2xl p-6">
                <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                  <BookOpen size={18} className="text-accent" />
                  در این مقاله می‌خوانید
                </h3>
                <ul className="space-y-3 text-sm">
                  {headings.map((heading) => (
                    <li key={heading.id}>
                      <a
                        href={`#${heading.id}`}
                        className={`text-foreground-muted hover:text-accent block border-r-2 border-transparent hover:border-accent pr-3 transition-all ${heading.level === 3 ? "mr-3 text-[13px]" : ""}`}
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 👇 مقالات مرتبط */}
            {relatedArticles.length > 0 && (
              <div className="bg-primary text-white rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl pointer-events-none" />
                <h3 className="font-bold mb-6 relative z-10">مقالات مرتبط</h3>
                <div className="space-y-6 relative z-10">
                  {relatedArticles.map((related) => (
                    <Link
                      key={related.id}
                      href={`/insights/${related.slug}`}
                      className="group block"
                    >
                      <div className="text-[10px] text-accent mb-1 font-bold">
                        {related.category}
                      </div>
                      <h4 className="text-sm font-semibold leading-relaxed group-hover:text-accent transition-colors mb-2">
                        {related.title}
                      </h4>
                      <span className="text-xs text-white/50 flex items-center gap-1 group-hover:gap-2 transition-all">
                        مطالعه مقاله <ArrowRight size={12} />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </Container>
    </div>
  );
}
