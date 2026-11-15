import { Router } from "express";
import { ArticlesController } from "./articles.controller";
import { ArticlesAdminController } from "./articles.admin.controller";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { AuthRequest } from "../../middleware/auth.middleware";

const router = Router();
const publicController = new ArticlesController();
const adminController = new ArticlesAdminController();

// ====== ۱. مسیرهای مدیریتی (باید اول باشند) ======
router.get(
  "/admin/list",
  requireAuth,
  requireRole(["SUPER_ADMIN", "EDITOR"]),
  (req, res) => adminController.getAll(req as AuthRequest, res),
);
router.post(
  "/admin/create",
  requireAuth,
  requireRole(["SUPER_ADMIN", "EDITOR"]),
  (req, res) => adminController.create(req as AuthRequest, res),
);
router.get(
  "/admin/:id",
  requireAuth,
  requireRole(["SUPER_ADMIN", "EDITOR"]),
  (req, res) => adminController.getById(req as AuthRequest, res),
);
router.patch(
  "/admin/:id",
  requireAuth,
  requireRole(["SUPER_ADMIN", "EDITOR"]),
  (req, res) => adminController.update(req as AuthRequest, res),
);
router.delete(
  "/admin/:id",
  requireAuth,
  requireRole(["SUPER_ADMIN", "EDITOR"]),
  (req, res) => adminController.delete(req as AuthRequest, res),
);

// ======  مسیرهای عمومی (بعد از مسیرهای خاص) ======
router.get("/", (req, res) => publicController.getAll(req, res));
router.get("/:slug", (req, res) => publicController.getBySlug(req, res));

export default router;
