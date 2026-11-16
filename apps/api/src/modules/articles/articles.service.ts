import { prisma } from "../../config/prisma";

export class ArticlesService {
  // دریافت مقالات برای سایت عمومی
  async getPublishedArticles() {
    return prisma.article.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
    });
  }

  async getArticleBySlug(slug: string) {
    return prisma.article.findUnique({
      where: { slug, status: "published" },
    });
  }

  // دریافت مقالات برای پنل ادمین (شامل پیش‌نویس‌ها)
  async getAllArticlesForAdmin() {
    return prisma.article.findMany({
      orderBy: { createdAt: "desc" },
    });
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
    },
  ) {
    return prisma.article.update({
      where: { id },
      data: {
        ...data,
        // اگه coverImage ارسال شده، ذخیره کن (حتی اگه null باشه)
        ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
        ...(data.status === "published" && { publishedAt: new Date() }),
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
