import { Router, Request, Response } from "express";
import { ProfileController } from "./profile.controller";

const router = Router();
const controller = new ProfileController();

// این مسیر فقط برای دریافت تنظیمات عمومی است (بدون هیچ میدل‌وری)
router.get("/", (req: Request, res: Response) =>
  controller.getPublicSettings(req, res),
);

export default router;
