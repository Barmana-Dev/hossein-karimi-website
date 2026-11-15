"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticlesService = void 0;
const prisma_1 = require("../../config/prisma");
class ArticlesService {
    // دریافت مقالات برای سایت عمومی
    async getPublishedArticles() {
        return prisma_1.prisma.article.findMany({
            where: { status: "published" },
            orderBy: { publishedAt: "desc" },
        });
    }
    async getArticleBySlug(slug) {
        return prisma_1.prisma.article.findUnique({
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
        return prisma_1.prisma.article.update({
            where: { id },
            data: {
                ...data,
                // اگر وضعیت به published تغییر کرد و قبلاً منتشر نشده بود
                ...(data.status === "published" && { publishedAt: new Date() }),
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
