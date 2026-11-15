import { Router } from "express";
import multer from "multer";
import path from "path";
import { MediaController } from "./media.controller";
import { MediaItemController } from "./media-item.controller";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { AuthRequest } from "../../middleware/auth.middleware";

const router = Router();
const uploadController = new MediaController();
const itemController = new MediaItemController();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname),
    ),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // سقف 5 مگابایت
  fileFilter: (req, file, cb) => {
    // 👇 فقط اجازه آپلود تصاویر با پسوندهای امن
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("فقط فایل‌های تصویری (JPEG, PNG, WebP, GIF) مجاز هستند."));
    }
  },
});

// ====== ۱. مسیرهای آپلود و کتابخانه رسانه ======
router.post(
  "/upload",
  requireAuth,
  requireRole(["SUPER_ADMIN", "EDITOR"]),
  upload.single("file"),
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
