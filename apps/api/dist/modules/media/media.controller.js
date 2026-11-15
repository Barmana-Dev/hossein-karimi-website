"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaController = void 0;
const prisma_1 = require("../../config/prisma");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class MediaController {
    async upload(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: { message: "فایلی انتخاب نشده است" },
                });
            }
            const fileUrl = `/uploads/${req.file.filename}`;
            const asset = await prisma_1.prisma.asset.create({
                data: {
                    urlOrKey: fileUrl,
                    mimeType: req.file.mimetype,
                    size: req.file.size,
                    altText: req.body.altText || req.file.originalname,
                    uploadedBy: req.user?.userId,
                },
            });
            res.status(201).json({ success: true, data: asset });
        }
        catch (error) {
            // 👇 اصلاح خطای unknown
            const message = error instanceof Error ? error.message : "خطا در آپلود";
            res.status(500).json({ success: false, error: { message } });
        }
    }
    async getAll(req, res) {
        try {
            const assets = await prisma_1.prisma.asset.findMany({
                orderBy: { createdAt: "desc" },
            });
            res.json({ success: true, data: assets });
        }
        catch (error) {
            // 👇 اصلاح خطای unknown
            const message = error instanceof Error ? error.message : "خطا در دریافت لیست";
            res.status(500).json({ success: false, error: { message } });
        }
    }
    async deleteAsset(req, res) {
        try {
            const id = req.params.id;
            // ۱. پیدا کردن اطلاعات فایل در دیتابیس
            const asset = await prisma_1.prisma.asset.findUnique({ where: { id } });
            if (!asset) {
                return res
                    .status(404)
                    .json({ success: false, error: { message: "فایل یافت نشد" } });
            }
            // ۲. حذف فایل فیزیکی از پوشه uploads
            // آدرس فایل در دیتابیس به شکل /uploads/filename.jpg ذخیره شده است
            const fileName = asset.urlOrKey.replace("/uploads/", "");
            const filePath = path_1.default.join(process.cwd(), "uploads", fileName);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath); // حذف فایل از دیسک
            }
            // ۳. حذف رکورد از دیتابیس
            await prisma_1.prisma.asset.delete({ where: { id } });
            res.json({ success: true, message: "فایل با موفقیت حذف شد" });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "خطا در حذف فایل";
            res.status(500).json({ success: false, error: { message } });
        }
    }
}
exports.MediaController = MediaController;
