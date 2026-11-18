"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticlesAdminController = void 0;
const error_message_1 = require("../../lib/error-message");
const articles_service_1 = require("./articles.service");
const client_1 = require("../../generated/prisma/client");
const validators_1 = require("../../validators");
const zod_1 = require("zod");
const pagination_1 = require("../../lib/pagination");
const articlesService = new articles_service_1.ArticlesService();
class ArticlesAdminController {
    async getAll(req, res) {
        try {
            const params = (0, pagination_1.getPageParams)(req);
            const { items, total } = await articlesService.getAllArticlesForAdmin(params.paginated
                ? {
                    skip: params.skip,
                    take: params.limit,
                    search: params.search,
                    status: params.status ?? undefined,
                }
                : { search: params.search, status: params.status ?? undefined });
            res.json({
                success: true,
                data: items,
                meta: params.paginated
                    ? (0, pagination_1.buildMeta)(total, params.page, params.limit)
                    : undefined,
            });
        }
        catch (error) {
            const message = (0, error_message_1.publicErrorMessage)(error, "خطای ناشناخته");
            res.status(500).json({ success: false, error: { message } });
        }
    }
    async create(req, res) {
        try {
            const validated = validators_1.articleCreateSchema.parse(req.body);
            // 👇 authorName رو پاس نده — سرویس خودش ست می‌کنه
            const article = await articlesService.createArticle(validated);
            res.status(201).json({ success: true, data: article });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        fields: error.flatten().fieldErrors,
                    },
                });
            }
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === "P2002") {
                    return res.status(400).json({
                        success: false,
                        error: { message: "این اسلاگ قبلاً استفاده شده است." },
                    });
                }
            }
            const message = (0, error_message_1.publicErrorMessage)(error, "خطای ناشناخته");
            res.status(500).json({ success: false, error: { message } });
        }
    }
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
            const message = (0, error_message_1.publicErrorMessage)(error, "خطای ناشناخته");
            res.status(500).json({ success: false, error: { message } });
        }
    }
    async update(req, res) {
        try {
            const id = req.params.id;
            const validated = validators_1.articleUpdateSchema.parse(req.body);
            const article = await articlesService.updateArticle(id, validated);
            res.json({ success: true, data: article });
        }
        catch (error) {
            if (error instanceof articles_service_1.ArticleNotFoundError) {
                return res.status(404).json({
                    success: false,
                    error: { message: "مقاله یافت نشد" },
                });
            }
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        fields: error.flatten().fieldErrors,
                    },
                });
            }
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002") {
                return res.status(400).json({
                    success: false,
                    error: { message: "این اسلاگ قبلاً استفاده شده است." },
                });
            }
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === "P2025") {
                return res.status(404).json({
                    success: false,
                    error: { message: "مقاله یافت نشد" },
                });
            }
            const message = (0, error_message_1.publicErrorMessage)(error, "خطای ناشناخته");
            res.status(500).json({ success: false, error: { message } });
        }
    }
    async delete(req, res) {
        try {
            const id = req.params.id;
            await articlesService.deleteArticle(id);
            res.json({ success: true, message: "مقاله با موفقیت حذف شد" });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === "P2025") {
                return res.status(404).json({
                    success: false,
                    error: { message: "مقاله یافت نشد" },
                });
            }
            const message = (0, error_message_1.publicErrorMessage)(error, "خطای ناشناخته");
            res.status(500).json({ success: false, error: { message } });
        }
    }
}
exports.ArticlesAdminController = ArticlesAdminController;
