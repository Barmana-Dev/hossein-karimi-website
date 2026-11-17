import { Response } from "express";
import { ArticlesService, ArticleNotFoundError } from "./articles.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { Prisma } from "../../generated/prisma/client";
import { articleCreateSchema, articleUpdateSchema } from "../../validators";
import { ZodError } from "zod";
import { buildMeta, getPageParams } from "../../lib/pagination";

const articlesService = new ArticlesService();

export class ArticlesAdminController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const params = getPageParams(req);
      const { items, total } = await articlesService.getAllArticlesForAdmin(
        params.paginated
          ? {
              skip: params.skip,
              take: params.limit,
              search: params.search,
              status: params.status ?? undefined,
            }
          : { search: params.search, status: params.status ?? undefined },
      );
      res.json({
        success: true,
        data: items,
        meta: params.paginated
          ? buildMeta(total, params.page, params.limit)
          : undefined,
      });
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

      const article = await articlesService.updateArticle(id, validated);
      res.json({ success: true, data: article });
    } catch (error: unknown) {
      if (error instanceof ArticleNotFoundError) {
        return res.status(404).json({
          success: false,
          error: { message: "مقاله یافت نشد" },
        });
      }
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
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({
          success: false,
          error: { message: "مقاله یافت نشد" },
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
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({
          success: false,
          error: { message: "مقاله یافت نشد" },
        });
      }
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }
}
