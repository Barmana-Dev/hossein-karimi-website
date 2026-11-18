"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const error_message_1 = require("../../lib/error-message");
const dashboard_service_1 = require("./dashboard.service");
const dashboardService = new dashboard_service_1.DashboardService();
class DashboardController {
    async getStats(req, res) {
        try {
            // 👇 نقش رو از middleware بگیر و به service بده
            const role = req.user?.role;
            const data = await dashboardService.getStats(role);
            res.json({ success: true, data });
        }
        catch (error) {
            const message = (0, error_message_1.publicErrorMessage)(error, "خطا");
            res.status(500).json({ success: false, error: { message } });
        }
    }
}
exports.DashboardController = DashboardController;
