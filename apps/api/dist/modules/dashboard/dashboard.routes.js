"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("./dashboard.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const controller = new dashboard_controller_1.DashboardController();
// دسترسی برای همه کاربران لاگین شده
router.get("/", auth_middleware_1.requireAuth, (req, res) => controller.getStats(req, res));
exports.default = router;
