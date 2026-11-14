import { Response } from "express";
import { ArticlesService } from "./articles.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { Prisma } from "../../generated/prisma/client"; // 👈 ایمپورت مهم برای تشخیص خطای Prisma

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
      const article = await articlesService.createArticle(req.body);
      res.status(201).json({ success: true, data: article });
    } catch (error: unknown) {
      // 👇 مدیریت خطای تکراری بودن اسلاگ
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return res.status(400).json({
            success: false,
            error: {
              message:
                "این اسلاگ (آدرس یکتا) قبلاً استفاده شده است. لطفاً یک اسلاگ دیگر وارد کنید (مثلاً یک عدد به انتهای آن اضافه کنید).",
            },
          });
        }
      }

      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }

  // دریافت یک مقاله برای ویرایش
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

  // ویرایش مقاله
  async update(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const article = await articlesService.updateArticle(id, req.body);
      res.json({ success: true, data: article });
    } catch (error: unknown) {
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

  // حذف مقاله
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
