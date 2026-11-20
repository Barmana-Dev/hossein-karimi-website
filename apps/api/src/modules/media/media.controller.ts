import { publicErrorMessage } from "../../lib/error-message";
import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { prisma } from "../../config/prisma";
import path from "path";
import fs from "fs";
import { config } from "../../config/env";
import { buildMeta, getPageParams } from "../../lib/pagination";

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

// 👇 سقف‌های ایمنی تصویر: ابعاد بیش از حد و تعداد فریم غیرمعقول رد می‌شود
const MAX_IMAGE_DIMENSION = 8000;
const MAX_IMAGE_FRAMES = 600;

// 👇 فرمت گزارش‌شده توسط sharp برای هر MIME شناسایی‌شده
const SHARP_FORMAT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

// 👇 اعتبارسنجی واقعی با رمزگشا: امضا/ابعاد/بایت پایان کافی نیستند؛
// فایلی مثل GIF چهارده‌بایتی هیچ فریمی ندارد و باید پیش از ثبت Asset رد شود.
async function isDecodableImage(
  filePath: string,
  mime: string,
): Promise<boolean> {
  try {
    const { default: sharp } = await import("sharp");
    const animated = mime === "image/gif" || mime === "image/webp";
    const image = sharp(filePath, {
      animated,
      failOn: "error",
      limitInputPixels: MAX_IMAGE_DIMENSION * MAX_IMAGE_DIMENSION,
    });

    const metadata = await image.metadata();
    const expectedFormat = SHARP_FORMAT_BY_MIME[mime];
    if (!expectedFormat || metadata.format !== expectedFormat) return false;
    if (!metadata.width || !metadata.height) return false;
    if (
      metadata.width > MAX_IMAGE_DIMENSION ||
      metadata.height > MAX_IMAGE_DIMENSION
    ) {
      return false;
    }

    const frames = metadata.pages ?? 1;
    if (!Number.isInteger(frames) || frames < 1 || frames > MAX_IMAGE_FRAMES) {
      return false;
    }

    // 👇 رمزگشایی کامل پیکسل‌ها؛ فایل بدون فریم اینجا خطا می‌دهد
    await sharp(filePath, { animated, failOn: "error" }).toBuffer();
    return true;
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
      // 👇 امضای فایل کافی نیست؛ تصویر باید واقعاً قابل رمزگشایی باشد
      // (همهٔ فرمت‌ها، از جمله GIF، با sharp بررسی می‌شوند)
      const structurallyValid = detected
        ? await isDecodableImage(req.file.path, detected.mime)
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
      // 👇 کتابخانه رسانه می‌تواند خیلی بزرگ شود؛ با ارسال page/limit
      // پاسخ صفحه‌بندی می‌شود و بدون آن (مثل انتخابگر تصویر) کل فهرست
      // برای سازگاری با کدهای قبلی برگردانده می‌شود.
      const params = getPageParams(req, 24);
      const where = params.search
        ? {
            OR: [
              {
                altText: {
                  contains: params.search,
                  mode: "insensitive" as const,
                },
              },
              {
                urlOrKey: {
                  contains: params.search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {};

      if (!params.paginated) {
        const assets = await prisma.asset.findMany({
          where,
          orderBy: { createdAt: "desc" },
        });
        return res.json({ success: true, data: assets });
      }

      const [items, total] = await Promise.all([
        prisma.asset.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: params.skip,
          take: params.limit,
        }),
        prisma.asset.count({ where }),
      ]);

      return res.json({
        success: true,
        data: items,
        meta: buildMeta(total, params.page, params.limit),
      });
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
