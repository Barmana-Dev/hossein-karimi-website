"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaController = void 0;
const error_message_1 = require("../../lib/error-message");
const prisma_1 = require("../../config/prisma");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("../../config/env");
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
// 👇 GIF باید ساختار پایه داشته باشد (ابعاد معتبر و بایت پایان بخش)
function isValidGif(filePath) {
    try {
        const stats = fs_1.default.statSync(filePath);
        if (stats.size < 14)
            return false;
        const fd = fs_1.default.openSync(filePath, "r");
        const header = Buffer.alloc(13);
        fs_1.default.readSync(fd, header, 0, 13, 0);
        const trailer = Buffer.alloc(1);
        fs_1.default.readSync(fd, trailer, 0, 1, stats.size - 1);
        fs_1.default.closeSync(fd);
        const width = header.readUInt16LE(6);
        const height = header.readUInt16LE(8);
        return width > 0 && height > 0 && trailer[0] === 0x3b;
    }
    catch {
        return false;
    }
}
// 👇 سلامت ساختار تصویر (فرمت‌های غیر GIF) با رمزگشای sharp بررسی می‌شود
async function isDecodableImage(filePath) {
    try {
        const { default: sharp } = await Promise.resolve().then(() => __importStar(require("sharp")));
        const metadata = await sharp(filePath).metadata();
        return Boolean(metadata.width && metadata.height && metadata.format);
    }
    catch {
        return false;
    }
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
            // 👇 امضای فایل کافی نیست؛ ساختار تصویر هم باید قابل رمزگشایی باشد
            const structurallyValid = detected
                ? detected.mime === "image/gif"
                    ? isValidGif(req.file.path)
                    : await isDecodableImage(req.file.path)
                : false;
            if (!detected || detected.mime !== req.file.mimetype || !structurallyValid) {
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
            const message = (0, error_message_1.publicErrorMessage)(error, "خطا در آپلود");
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
            const message = (0, error_message_1.publicErrorMessage)(error, "خطا در دریافت لیست");
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
            const fileName = path_1.default.basename(asset.urlOrKey.replace("/uploads/", ""));
            const filePath = path_1.default.join(env_1.config.uploadsDir, fileName);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
            await prisma_1.prisma.asset.delete({ where: { id } });
            res.json({ success: true, message: "فایل با موفقیت حذف شد" });
        }
        catch (error) {
            const message = (0, error_message_1.publicErrorMessage)(error, "خطا در حذف فایل");
            res.status(500).json({ success: false, error: { message } });
        }
    }
}
exports.MediaController = MediaController;
