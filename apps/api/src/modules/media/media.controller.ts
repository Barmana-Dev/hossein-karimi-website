import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { prisma } from "../../config/prisma";
import path from "path";
import fs from "fs";

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
      // 👇 اصلاح خطای unknown
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
      // 👇 اصلاح خطای unknown
      const message =
        error instanceof Error ? error.message : "خطا در دریافت لیست";
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async deleteAsset(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;

      // ۱. پیدا کردن اطلاعات فایل در دیتابیس
      const asset = await prisma.asset.findUnique({ where: { id } });
      if (!asset) {
        return res
          .status(404)
          .json({ success: false, error: { message: "فایل یافت نشد" } });
      }

      // ۲. حذف فایل فیزیکی از پوشه uploads
      // آدرس فایل در دیتابیس به شکل /uploads/filename.jpg ذخیره شده است
      const fileName = asset.urlOrKey.replace("/uploads/", "");
      const filePath = path.join(process.cwd(), "uploads", fileName);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // حذف فایل از دیسک
      }

      // ۳. حذف رکورد از دیتابیس
      await prisma.asset.delete({ where: { id } });

      res.json({ success: true, message: "فایل با موفقیت حذف شد" });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "خطا در حذف فایل";
      res.status(500).json({ success: false, error: { message } });
    }
  }
}
