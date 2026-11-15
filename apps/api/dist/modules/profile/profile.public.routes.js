"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profile_controller_1 = require("./profile.controller");
const router = (0, express_1.Router)();
const controller = new profile_controller_1.ProfileController();
// این مسیر فقط برای دریافت تنظیمات عمومی است (بدون هیچ میدل‌وری)
router.get("/", (req, res) => controller.getPublicSettings(req, res));
exports.default = router;
