import { Response } from "express";
import { DashboardService } from "./dashboard.service";
import { AuthRequest } from "../../middleware/auth.middleware";

const dashboardService = new DashboardService();

export class DashboardController {
  async getStats(req: AuthRequest, res: Response) {
    try {
      // در اینجا می‌توانیم بر اساس req.user?.role تصمیم بگیریم چه دیتایی برگردانیم
      // فعلاً همه دیتا را برمی‌گردانیم و در فرانت‌اند بر اساس نقش مخفی می‌کنیم
      const data = await dashboardService.getStats();
      res.json({ success: true, data });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطا";
      res.status(500).json({ success: false, error: { message } });
    }
  }
}
