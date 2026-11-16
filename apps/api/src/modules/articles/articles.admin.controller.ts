import { Response } from "express";
import { ArticlesService } from "./articles.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { Prisma } from "../../generated/prisma/client";
import { articleCreateSchema, articleUpdateSchema } from "../../validators";
import { ZodError } from "zod";

const articlesService = new ArticlesService();

export class ArticlesAdminController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const articles = await articlesService.getAllArticlesForAdmin();
      res.json({ success: true, data: articles });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const validated = articleCreateSchema.parse(req.body);
      // 👇 authorName رو پاس نده — سرویس خودش ست می‌کنه
      const article = await articlesService.createArticle(validated);
      res.status(201).json({ success: true, data: article });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            fields: error.flatten().fieldErrors,
          },
        });
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return res.status(400).json({
            success: false,
            error: { message: "این اسلاگ قبلاً استفاده شده است." },
          });
        }
      }
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const article = await articlesService.getArticleById(id);
      if (!article)
        return res
          .status(404)
          .json({ success: false, error: { message: "مقاله یافت نشد" } });
      res.json({ success: true, data: article });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const validated = articleUpdateSchema.parse(req.body);

      console.log("📥 validated:", validated);
      const article = await articlesService.updateArticle(id, validated);
      res.json({ success: true, data: article });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            fields: error.flatten().fieldErrors,
          },
        });
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return res.status(400).json({
          success: false,
          error: { message: "این اسلاگ قبلاً استفاده شده است." },
        });
      }
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      await articlesService.deleteArticle(id);
      res.json({ success: true, message: "مقاله با موفقیت حذف شد" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }
}
