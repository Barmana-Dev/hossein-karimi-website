import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { AuthRequest } from "../../middleware/auth.middleware";

const router = Router();
const controller = new DashboardController();

// دسترسی برای همه کاربران لاگین شده
router.get("/", requireAuth, (req, res) =>
  controller.getStats(req as AuthRequest, res),
);

export default router;
