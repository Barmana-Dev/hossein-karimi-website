"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const media_controller_1 = require("./media.controller");
const media_item_controller_1 = require("./media-item.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const uploadController = new media_controller_1.MediaController();
const itemController = new media_item_controller_1.MediaItemController();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path_1.default.extname(file.originalname)),
});
const upload = (0, multer_1.default)({
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
        }
        else {
            cb(new Error("فقط فایل‌های تصویری (JPEG, PNG, WebP, GIF) مجاز هستند."));
        }
    },
});
// ====== ۱. مسیرهای آپلود و کتابخانه رسانه ======
router.post("/upload", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "EDITOR"]), upload.single("file"), (req, res) => uploadController.upload(req, res));
router.get("/list", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "EDITOR"]), (req, res) => uploadController.getAll(req, res));
router.delete("/asset/:id", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "EDITOR"]), (req, res) => uploadController.deleteAsset(req, res)); // 👈 مسیر اصلاح شد
// ====== ۲. مسیرهای رسانه و رویدادها (ادمین) ======
router.get("/admin/list", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "EDITOR"]), (req, res) => itemController.adminGetAll(req, res));
router.post("/admin/create", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "EDITOR"]), (req, res) => itemController.adminCreate(req, res));
router.get("/admin/:id", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "EDITOR"]), (req, res) => itemController.adminGetById(req, res));
router.patch("/admin/:id", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "EDITOR"]), (req, res) => itemController.adminUpdate(req, res));
router.delete("/admin/:id", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "EDITOR"]), (req, res) => itemController.adminDelete(req, res));
// ====== ۳. مسیرهای عمومی ======
router.get("/", (req, res) => itemController.getAll(req, res));
exports.default = router;
