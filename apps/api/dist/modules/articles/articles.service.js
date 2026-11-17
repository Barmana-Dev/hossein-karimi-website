"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticlesService = exports.ArticleNotFoundError = void 0;
const prisma_1 = require("../../config/prisma");
// 👇 خطای «یافت نشد» تا کنترلر بتواند ۴۰۴ برگرداند (نه ۵۰۰)
class ArticleNotFoundError extends Error {
    constructor() {
        super("مقاله یافت نشد");
        this.name = "ArticleNotFoundError";
    }
}
exports.ArticleNotFoundError = ArticleNotFoundError;
class ArticlesService {
    // دریافت مقالات برای سایت عمومی
    async getPublishedArticles() {
        return prisma_1.prisma.article.findMany({
            where: { status: "published" },
            orderBy: { publishedAt: "desc" },
        });
    }
    async getArticleBySlug(slug) {
        // findFirst چون وضعیت هم شرط دارد (findUnique فقط کلید یکتا می‌پذیرد)
        return prisma_1.prisma.article.findFirst({
            where: { slug, status: "published" },
        });
    }
    // دریافت مقالات برای پنل ادمین (شامل پیش‌نویس‌ها)
    async getAllArticlesForAdmin() {
        return prisma_1.prisma.article.findMany({
            orderBy: { createdAt: "desc" },
        });
    }
    // ایجاد مقاله جدید توسط ادمین
    async createArticle(data) {
        return prisma_1.prisma.article.create({
            data: {
                ...data,
                authorName: "دکتر حسین کریمی",
                readTime: data.readTime || 5,
                publishedAt: data.status === "published" ? new Date() : null,
            },
        });
    }
    // دریافت یک مقاله با ID (برای فرم ویرایش)
    async getArticleById(id) {
        return prisma_1.prisma.article.findUnique({
            where: { id },
        });
    }
    // ویرایش مقاله
    async updateArticle(id, data) {
        const existing = await prisma_1.prisma.article.findUnique({
            where: { id },
            select: { publishedAt: true },
        });
        if (!existing)
            throw new ArticleNotFoundError();
        // 👇 تاریخ انتشار فقط در اولین انتشار ست می‌شود و با هر ویرایش عوض نمی‌شود
        const publishedAt = data.publishedAt !== undefined
            ? data.publishedAt
                ? new Date(data.publishedAt)
                : null
            : data.status === "published" && !existing.publishedAt
                ? new Date()
                : undefined;
        return prisma_1.prisma.article.update({
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
    async deleteArticle(id) {
        return prisma_1.prisma.article.delete({
            where: { id },
        });
    }
}
exports.ArticlesService = ArticlesService;
