"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticlesAdminController = void 0;
const articles_service_1 = require("./articles.service");
const client_1 = require("../../generated/prisma/client"); // 👈 ایمپورت مهم برای تشخیص خطای Prisma
const articlesService = new articles_service_1.ArticlesService();
class ArticlesAdminController {
    async getAll(req, res) {
        try {
            const articles = await articlesService.getAllArticlesForAdmin();
            res.json({ success: true, data: articles });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "خطای ناشناخته";
            res.status(500).json({ success: false, error: { message } });
        }
    }
    async create(req, res) {
        try {
            const article = await articlesService.createArticle(req.body);
            res.status(201).json({ success: true, data: article });
        }
        catch (error) {
            // 👇 مدیریت خطای تکراری بودن اسلاگ
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === "P2002") {
                    return res.status(400).json({
                        success: false,
                        error: {
                            message: "این اسلاگ (آدرس یکتا) قبلاً استفاده شده است. لطفاً یک اسلاگ دیگر وارد کنید (مثلاً یک عدد به انتهای آن اضافه کنید).",
                        },
                    });
                }
            }
            const message = error instanceof Error ? error.message : "خطای ناشناخته";
            res.status(500).json({ success: false, error: { message } });
        }
    }
    // دریافت یک مقاله برای ویرایش
    async getById(req, res) {
        try {
            const id = req.params.id;
            const article = await articlesService.getArticleById(id);
            if (!article)
                return res
                    .status(404)
                    .json({ success: false, error: { message: "مقاله یافت نشد" } });
            res.json({ success: true, data: article });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "خطای ناشناخته";
            res.status(500).json({ success: false, error: { message } });
        }
    }
    // ویرایش مقاله
    async update(req, res) {
        try {
            const id = req.params.id;
            const article = await articlesService.updateArticle(id, req.body);
            res.json({ success: true, data: article });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002") {
                return res.status(400).json({
                    success: false,
                    error: { message: "این اسلاگ قبلاً استفاده شده است." },
                });
            }
            const message = error instanceof Error ? error.message : "خطای ناشناخته";
            res.status(500).json({ success: false, error: { message } });
        }
    }
    // حذف مقاله
    async delete(req, res) {
        try {
            const id = req.params.id;
            await articlesService.deleteArticle(id);
            res.json({ success: true, message: "مقاله با موفقیت حذف شد" });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "خطای ناشناخته";
            res.status(500).json({ success: false, error: { message } });
        }
    }
}
exports.ArticlesAdminController = ArticlesAdminController;
