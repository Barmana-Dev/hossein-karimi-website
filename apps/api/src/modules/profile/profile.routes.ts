import { Router, Request, Response } from "express";
import { ProfileController } from "./profile.controller";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { AuthRequest } from "../../middleware/auth.middleware";

const router = Router();
const controller = new ProfileController();

// مسیر عمومی (بدون لاگین)
router.get("/public", (req: Request, res: Response) =>
  controller.getPublicSettings(req, res),
);

// مسیرهای مدیریتی (با لاگین)
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
