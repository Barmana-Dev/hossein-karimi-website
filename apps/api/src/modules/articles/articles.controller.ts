import { publicErrorMessage } from "../../lib/error-message";
import { Request, Response } from "express";
import { ArticlesService } from "./articles.service";

const articlesService = new ArticlesService();

export class ArticlesController {
  async getAll(req: Request, res: Response) {
    try {
      const articles = await articlesService.getPublishedArticles();
      res.json({ success: true, data: articles });
    } catch (error: unknown) {
      const message = publicErrorMessage(error, "خطای ناشناخته");
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async getBySlug(req: Request, res: Response) {
    try {
      const slug = req.params.slug as string;
      const article = await articlesService.getArticleBySlug(slug);

      if (!article) {
        return res
          .status(404)
          .json({ success: false, error: { message: "مقاله یافت نشد" } });
      }

      res.json({ success: true, data: article });
    } catch (error: unknown) {
      const message = publicErrorMessage(error, "خطای ناشناخته");
      res.status(500).json({ success: false, error: { message } });
    }
  }
}
