"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticlesController = void 0;
const error_message_1 = require("../../lib/error-message");
const articles_service_1 = require("./articles.service");
const articlesService = new articles_service_1.ArticlesService();
class ArticlesController {
    async getAll(req, res) {
        try {
            const articles = await articlesService.getPublishedArticles();
            res.json({ success: true, data: articles });
        }
        catch (error) {
            const message = (0, error_message_1.publicErrorMessage)(error, "خطای ناشناخته");
            res.status(500).json({ success: false, error: { message } });
        }
    }
    async getBySlug(req, res) {
        try {
            const slug = req.params.slug;
            const article = await articlesService.getArticleBySlug(slug);
            if (!article) {
                return res
                    .status(404)
                    .json({ success: false, error: { message: "مقاله یافت نشد" } });
            }
            res.json({ success: true, data: article });
        }
        catch (error) {
            const message = (0, error_message_1.publicErrorMessage)(error, "خطای ناشناخته");
            res.status(500).json({ success: false, error: { message } });
        }
    }
}
exports.ArticlesController = ArticlesController;
