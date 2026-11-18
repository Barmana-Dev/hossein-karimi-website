import { publicErrorMessage } from "../../lib/error-message";
import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { prisma } from "../../config/prisma";
import path from "path";
import fs from "fs";
import { config } from "../../config/env";

// ===== بررسی محتوای واقعی فایل (امضای بایت‌های ابتدایی) =====
interface DetectedImage {
  mime: string;
  ext: string;
}

function detectImageType(filePath: string): DetectedImage | null {
  let buffer: Buffer;
  try {
    const fd = fs.openSync(filePath, "r");
    buffer = Buffer.alloc(12);
    fs.readSync(fd, buffer, 0, 12, 0);
    fs.closeSync(fd);
  } catch {
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
  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { mime: "image/webp", ext: ".webp" };
  }
  return null;
}

// 👇 GIF باید ساختار پایه داشته باشد (ابعاد معتبر و بایت پایان بخش)
function isValidGif(filePath: string): boolean {
  try {
    const stats = fs.statSync(filePath);
    if (stats.size < 14) return false;

    const fd = fs.openSync(filePath, "r");
    const header = Buffer.alloc(13);
    fs.readSync(fd, header, 0, 13, 0);
    const trailer = Buffer.alloc(1);
    fs.readSync(fd, trailer, 0, 1, stats.size - 1);
    fs.closeSync(fd);

    const width = header.readUInt16LE(6);
    const height = header.readUInt16LE(8);
    return width > 0 && height > 0 && trailer[0] === 0x3b;
  } catch {
    return false;
  }
}

// 👇 سلامت ساختار تصویر (فرمت‌های غیر GIF) با رمزگشای sharp بررسی می‌شود
async function isDecodableImage(filePath: string): Promise<boolean> {
  try {
    const { default: sharp } = await import("sharp");
    const metadata = await sharp(filePath).metadata();
    return Boolean(metadata.width && metadata.height && metadata.format);
  } catch {
    return false;
  }
}

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

      // 👇 نوع فایل از روی محتوای واقعی آن بررسی می‌شود، نه فقط هدر MIME
      const detected = detectImageType(req.file.path);
      // 👇 امضای فایل کافی نیست؛ ساختار تصویر هم باید قابل رمزگشایی باشد
      const structurallyValid = detected
        ? detected.mime === "image/gif"
          ? isValidGif(req.file.path)
          : await isDecodableImage(req.file.path)
        : false;

      if (!detected || detected.mime !== req.file.mimetype || !structurallyValid) {
        await fs.promises.unlink(req.file.path).catch(() => undefined);
        return res.status(400).json({
          success: false,
          error: {
            message:
              "فایل ارسالی تصویر معتبری نیست. فقط JPEG، PNG، WebP و GIF مجاز هستند.",
          },
        });
      }

      // 👇 پسوند فایل ذخیره‌شده با محتوای واقعی هماهنگ می‌شود
      let fileName = req.file.filename;
      if (path.extname(fileName).toLowerCase() !== detected.ext) {
        fileName = `${path.basename(fileName, path.extname(fileName))}${
          detected.ext
        }`;
        await fs.promises.rename(
          req.file.path,
          path.join(path.dirname(req.file.path), fileName),
        );
      }

      const fileUrl = `/uploads/${fileName}`;
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
      const message = publicErrorMessage(error, "خطا در آپلود");
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
      const message = publicErrorMessage(error, "خطا در دریافت لیست");
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
      const fileName = path.basename(asset.urlOrKey.replace("/uploads/", ""));
      const filePath = path.join(config.uploadsDir, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await prisma.asset.delete({ where: { id } });
      res.json({ success: true, message: "فایل با موفقیت حذف شد" });
    } catch (error: unknown) {
      const message = publicErrorMessage(error, "خطا در حذف فایل");
      res.status(500).json({ success: false, error: { message } });
    }
  }
}
