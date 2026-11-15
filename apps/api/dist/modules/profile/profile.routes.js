"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profile_controller_1 = require("./profile.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const controller = new profile_controller_1.ProfileController();
// مسیر عمومی (بدون لاگین)
router.get("/public", (req, res) => controller.getPublicSettings(req, res));
// مسیرهای مدیریتی (با لاگین)
router.get("/", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN"]), (req, res) => controller.get(req, res));
router.put("/", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN"]), (req, res) => controller.update(req, res));
exports.default = router;
