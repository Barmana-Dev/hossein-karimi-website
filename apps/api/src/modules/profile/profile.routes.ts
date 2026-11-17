import { Router } from "express";
import { ProfileController } from "./profile.controller";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { AuthRequest } from "../../middleware/auth.middleware";

const router = Router();
const controller = new ProfileController();

// مسیرهای مدیریتی (با لاگین) — تنظیمات عمومی در /api/v1/public/settings سرو می‌شود
router.get(
  "/",
  requireAuth,
  requireRole(["SUPER_ADMIN"]),
  (req: AuthRequest, res) => controller.get(req, res),
);
router.put(
  "/",
  requireAuth,
  requireRole(["SUPER_ADMIN"]),
  (req: AuthRequest, res) => controller.update(req, res),
);

export default router;
