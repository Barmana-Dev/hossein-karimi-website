import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { prisma } from "../../config/prisma";
import path from "path";
import fs from "fs";
import { MediaItemService } from "./media.service";
import { mediaCreateSchema, mediaUpdateSchema } from "../../validators";
import { ZodError } from "zod";

const mediaService = new MediaItemService();

// ===== MediaController (آپلود فایل و کتابخانه رسانه) =====
export class MediaController {
  async upload(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { message: "فایلی انتخاب نشده است" },
        });
      }
      const fileUrl = `/uploads/${req.file.filename}`;
      const asset = await prisma.asset.create({
        data: {
          urlOrKey: fileUrl,
          mimeType: req.file.mimetype,
          size: req.file.size,
          altText: req.body.altText || req.file.originalname,
          uploadedBy: req.user?.userId,
        },
      });
      res.status(201).json({ success: true, data: asset });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطا در آپلود";
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async getAll(req: AuthRequest, res: Response) {
    try {
      const assets = await prisma.asset.findMany({
        orderBy: { createdAt: "desc" },
      });
      res.json({ success: true, data: assets });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "خطا در دریافت لیست";
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async deleteAsset(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const asset = await prisma.asset.findUnique({ where: { id } });
      if (!asset) {
        return res
          .status(404)
          .json({ success: false, error: { message: "فایل یافت نشد" } });
      }
      const fileName = asset.urlOrKey.replace("/uploads/", "");
      const filePath = path.join(process.cwd(), "uploads", fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await prisma.asset.delete({ where: { id } });
      res.json({ success: true, message: "فایل با موفقیت حذف شد" });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "خطا در حذف فایل";
      res.status(500).json({ success: false, error: { message } });
    }
  }
}

// ===== MediaItemController (CRUD رسانه‌ها) =====
export class MediaItemController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const data = await mediaService.getPublishedMedia();
      res.json({ success: true, data });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async adminGetAll(req: AuthRequest, res: Response) {
    try {
      const data = await mediaService.getAllMediaForAdmin();
      res.json({ success: true, data });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async adminCreate(req: AuthRequest, res: Response) {
    try {
      const validated = mediaCreateSchema.parse(req.body);
      const data = await mediaService.createMedia(validated);
      res.status(201).json({ success: true, data });
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
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async adminGetById(req: AuthRequest, res: Response) {
    try {
      const data = await mediaService.getMediaById(req.params.id as string);
      if (!data)
        return res
          .status(404)
          .json({ success: false, error: { message: "یافت نشد" } });
      res.json({ success: true, data });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async adminUpdate(req: AuthRequest, res: Response) {
    try {
      const validated = mediaUpdateSchema.parse(req.body);
      const data = await mediaService.updateMedia(
        req.params.id as string,
        validated,
      );
      res.json({ success: true, data });
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
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async adminDelete(req: AuthRequest, res: Response) {
    try {
      await mediaService.deleteMedia(req.params.id as string);
      res.json({ success: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }
}
