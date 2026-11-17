import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { promises as fs } from "node:fs";
import path from "node:path";
import { MediaController } from "./media.controller";
import { MediaItemController } from "./media-item.controller";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { AuthRequest } from "../../middleware/auth.middleware";
import { config } from "../../config/env";

const router = Router();
const uploadController = new MediaController();
const itemController = new MediaItemController();

// 👇 پسوند فایل از نوع MIME اعلام‌شده گرفته می‌شود، نه از نام فایل کاربر
const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.uploadsDir),
  filename: (req, file, cb) =>
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        (EXTENSION_BY_MIME[file.mimetype] || ""),
    ),
});

const ALLOWED_MIME_TYPES = Object.keys(EXTENSION_BY_MIME);

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // سقف 5 مگابایت
  fileFilter: (req, file, cb) => {
    // 👇 فقط اجازه آپلود تصاویر با پسوندهای امن
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("فقط فایل‌های تصویری (JPEG, PNG, WebP, GIF) مجاز هستند."));
    }
  },
});

// 👇 خطاهای آپلود (حجم/نوع فایل) باید ۴۰۰ برگردانند، نه ۵۰۰
const uploadSingle = (req: Request, res: Response, next: NextFunction) => {
  upload.single("file")(req, res, (err: unknown) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "حجم فایل نباید بیشتر از ۵ مگابایت باشد."
          : "خطا در آپلود فایل.";
      return res.status(400).json({ success: false, error: { message } });
    }

    const message =
      err instanceof Error ? err.message : "فایل ارسالی معتبر نیست.";
    return res.status(400).json({ success: false, error: { message } });
  });
};

// 👇 تغییر اندازه و تبدیل به WebP بعد از آپلود (اگر sharp در دسترس باشد)
const optimizeUpload = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const file = req.file;
  // GIF را دست نمی‌زنیم تا انیمیشن حفظ شود
  if (!file || file.mimetype === "image/gif") return next();

  try {
    const { default: sharp } = await import("sharp");
    const targetPath = path.join(
      config.uploadsDir,
      path.basename(file.filename, path.extname(file.filename)) + ".webp",
    );

    await sharp(file.path)
      .rotate()
      .resize({
        width: 1920,
        height: 1920,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toFile(targetPath);

    await fs.unlink(file.path).catch(() => undefined);
    const stats = await fs.stat(targetPath);

    req.file = {
      ...file,
      path: targetPath,
      filename: path.basename(targetPath),
      destination: config.uploadsDir,
      mimetype: "image/webp",
      size: stats.size,
    };
  } catch (error) {
    // اگر فشرده‌سازی شکست خورد، فایل اصلی بدون تغییر آپلود می‌شود
    console.warn(
      "⚠️ فشرده‌سازی تصویر انجام نشد:",
      error instanceof Error ? error.message : error,
    );
  }

  return next();
};

// ====== ۱. مسیرهای آپلود و کتابخانه رسانه ======
router.post(
  "/upload",
  requireAuth,
  requireRole(["SUPER_ADMIN", "EDITOR"]),
  uploadSingle,
  (req, res, next) => void optimizeUpload(req, res, next),
  (req, res) => uploadController.upload(req as AuthRequest, res),
);
router.get(
  "/list",
  requireAuth,
  requireRole(["SUPER_ADMIN", "EDITOR"]),
  (req, res) => uploadController.getAll(req as AuthRequest, res),
);
router.delete(
  "/asset/:id",
  requireAuth,
  requireRole(["SUPER_ADMIN", "EDITOR"]),
  (req, res) => uploadController.deleteAsset(req as AuthRequest, res),
); // 👈 مسیر اصلاح شد

// ====== ۲. مسیرهای رسانه و رویدادها (ادمین) ======
router.get(
  "/admin/list",
  requireAuth,
  requireRole(["SUPER_ADMIN", "EDITOR"]),
  (req, res) => itemController.adminGetAll(req as AuthRequest, res),
);
router.post(
  "/admin/create",
  requireAuth,
  requireRole(["SUPER_ADMIN", "EDITOR"]),
  (req, res) => itemController.adminCreate(req as AuthRequest, res),
);
router.get(
  "/admin/:id",
  requireAuth,
  requireRole(["SUPER_ADMIN", "EDITOR"]),
  (req, res) => itemController.adminGetById(req as AuthRequest, res),
);
router.patch(
  "/admin/:id",
  requireAuth,
  requireRole(["SUPER_ADMIN", "EDITOR"]),
  (req, res) => itemController.adminUpdate(req as AuthRequest, res),
);
router.delete(
  "/admin/:id",
  requireAuth,
  requireRole(["SUPER_ADMIN", "EDITOR"]),
  (req, res) => itemController.adminDelete(req as AuthRequest, res),
);

// ====== ۳. مسیرهای عمومی ======
router.get("/", (req, res) => itemController.getAll(req, res));

export default router;
