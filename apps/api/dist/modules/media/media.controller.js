"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaController = void 0;
const prisma_1 = require("../../config/prisma");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function detectImageType(filePath) {
    let buffer;
    try {
        const fd = fs_1.default.openSync(filePath, "r");
        buffer = Buffer.alloc(12);
        fs_1.default.readSync(fd, buffer, 0, 12, 0);
        fs_1.default.closeSync(fd);
    }
    catch {
        return null;
    }
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return { mime: "image/jpeg", ext: ".jpg" };
    }
    if (buffer.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"))) {
        return { mime: "image/png", ext: ".png" };
    }
    const header6 = buffer.subarray(0, 6).toString("ascii");
    if (header6 === "GIF87a" || header6 === "GIF89a") {
        return { mime: "image/gif", ext: ".gif" };
    }
    if (buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
        buffer.subarray(8, 12).toString("ascii") === "WEBP") {
        return { mime: "image/webp", ext: ".webp" };
    }
    return null;
}
// ===== MediaController (آپلود فایل و کتابخانه رسانه) =====
class MediaController {
    async upload(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: { message: "فایلی انتخاب نشده است" },
                });
            }
            // 👇 نوع فایل از روی محتوای واقعی آن بررسی می‌شود، نه فقط هدر MIME
            const detected = detectImageType(req.file.path);
            if (!detected || detected.mime !== req.file.mimetype) {
                await fs_1.default.promises.unlink(req.file.path).catch(() => undefined);
                return res.status(400).json({
                    success: false,
                    error: {
                        message: "فایل ارسالی تصویر معتبری نیست. فقط JPEG، PNG، WebP و GIF مجاز هستند.",
                    },
                });
            }
            // 👇 پسوند فایل ذخیره‌شده با محتوای واقعی هماهنگ می‌شود
            let fileName = req.file.filename;
            if (path_1.default.extname(fileName).toLowerCase() !== detected.ext) {
                fileName = `${path_1.default.basename(fileName, path_1.default.extname(fileName))}${detected.ext}`;
                await fs_1.default.promises.rename(req.file.path, path_1.default.join(path_1.default.dirname(req.file.path), fileName));
            }
            const fileUrl = `/uploads/${fileName}`;
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
            const message = error instanceof Error ? error.message : "خطا در دریافت لیست";
            res.status(500).json({ success: false, error: { message } });
        }
    }
    async deleteAsset(req, res) {
        try {
            const id = req.params.id;
            const asset = await prisma_1.prisma.asset.findUnique({ where: { id } });
            if (!asset) {
                return res
                    .status(404)
                    .json({ success: false, error: { message: "فایل یافت نشد" } });
            }
            const fileName = asset.urlOrKey.replace("/uploads/", "");
            const filePath = path_1.default.join(process.cwd(), "uploads", fileName);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
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
