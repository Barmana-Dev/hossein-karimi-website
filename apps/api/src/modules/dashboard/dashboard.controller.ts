import { Response } from "express";
import { DashboardService } from "./dashboard.service";
import { AuthRequest } from "../../middleware/auth.middleware";

const dashboardService = new DashboardService();

export class DashboardController {
  async getStats(req: AuthRequest, res: Response) {
    try {
      // 👇 نقش رو از middleware بگیر و به service بده
      const role = req.user?.role;
      const data = await dashboardService.getStats(role);
      res.json({ success: true, data });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطا";
      res.status(500).json({ success: false, error: { message } });
    }
  }
}
