import { prisma } from "../../config/prisma";
import type { PageQuery } from "../../lib/pagination";

// 👇 خطای «یافت نشد» تا کنترلر بتواند ۴۰۴ برگرداند (نه ۵۰۰)
export class ArticleNotFoundError extends Error {
  constructor() {
    super("مقاله یافت نشد");
    this.name = "ArticleNotFoundError";
  }
}

export class ArticlesService {
  // دریافت مقالات برای سایت عمومی
  async getPublishedArticles() {
    return prisma.article.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
    });
  }

  async getArticleBySlug(slug: string) {
    // findFirst چون وضعیت هم شرط دارد (findUnique فقط کلید یکتا می‌پذیرد)
    return prisma.article.findFirst({
      where: { slug, status: "published" },
    });
  }

  // دریافت مقالات برای پنل ادمین (شامل پیش‌نویس‌ها)
  async getAllArticlesForAdmin(opts: PageQuery = {}) {
    const where = {
      ...(opts.status ? { status: opts.status } : {}),
      ...(opts.search
        ? {
            OR: [
              {
                title: { contains: opts.search, mode: "insensitive" as const },
              },
              {
                category: {
                  contains: opts.search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        ...(opts.take ? { skip: opts.skip, take: opts.take } : {}),
      }),
      prisma.article.count({ where }),
    ]);

    return { items, total };
  }

  // ایجاد مقاله جدید توسط ادمین
  async createArticle(data: {
    title: string;
    slug: string;
    excerpt: string;
    body: string;
    category: string;
    status: string;
    readTime?: number;
    coverImage?: string | null;
  }) {
    return prisma.article.create({
      data: {
        ...data,
        authorName: "دکتر حسین کریمی",
        readTime: data.readTime || 5,
        publishedAt: data.status === "published" ? new Date() : null,
      },
    });
  }

  // دریافت یک مقاله با ID (برای فرم ویرایش)
  async getArticleById(id: string) {
    return prisma.article.findUnique({
      where: { id },
    });
  }

  // ویرایش مقاله
  async updateArticle(
    id: string,
    data: {
      title?: string;
      slug?: string;
      excerpt?: string;
      body?: string;
      category?: string;
      status?: string;
      readTime?: number;
      coverImage?: string | null;
      publishedAt?: string | null;
    },
  ) {
    const existing = await prisma.article.findUnique({
      where: { id },
      select: { publishedAt: true },
    });
    if (!existing) throw new ArticleNotFoundError();

    // 👇 تاریخ انتشار فقط در اولین انتشار ست می‌شود و با هر ویرایش عوض نمی‌شود
    const publishedAt =
      data.publishedAt !== undefined
        ? data.publishedAt
          ? new Date(data.publishedAt)
          : null
        : data.status === "published" && !existing.publishedAt
          ? new Date()
          : undefined;

    return prisma.article.update({
      where: { id },
      data: {
        ...data,
        // اگه coverImage ارسال شده، ذخیره کن (حتی اگه null باشه)
        ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
        ...(publishedAt !== undefined && { publishedAt }),
      },
    });
  }

  // حذف مقاله
  async deleteArticle(id: string) {
    return prisma.article.delete({
      where: { id },
    });
  }
}
