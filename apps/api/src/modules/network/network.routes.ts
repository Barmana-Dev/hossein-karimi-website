import { Router } from "express";
import { NetworkController } from "./network.controller";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { AuthRequest } from "../../middleware/auth.middleware";

const router = Router();
const controller = new NetworkController();

// ====== ۱. مسیرهای مدیریتی ======
router.get(
  "/admin/list",
  requireAuth,
  requireRole(["SUPER_ADMIN", "EDITOR"]),
  (req, res) => controller.adminGetAll(req as AuthRequest, res),
);
router.post(
  "/admin/create",
  requireAuth,
  requireRole(["SUPER_ADMIN", "EDITOR"]),
  (req, res) => controller.adminCreate(req as AuthRequest, res),
);
router.get(
  "/admin/:id",
  requireAuth,
  requireRole(["SUPER_ADMIN", "EDITOR"]),
  (req, res) => controller.adminGetById(req as AuthRequest, res),
);
router.patch(
  "/admin/:id",
  requireAuth,
  requireRole(["SUPER_ADMIN", "EDITOR"]),
  (req, res) => controller.adminUpdate(req as AuthRequest, res),
);
router.delete(
  "/admin/:id",
  requireAuth,
  requireRole(["SUPER_ADMIN", "EDITOR"]),
  (req, res) => controller.adminDelete(req as AuthRequest, res),
);

// ====== ۲. مسیرهای عمومی ======
router.get("/", (req, res) => controller.getAll(req, res));
router.get("/:slug", (req, res) => controller.getBySlug(req, res));

export default router;
