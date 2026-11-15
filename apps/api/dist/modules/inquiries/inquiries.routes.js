"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inquiries_controller_1 = require("./inquiries.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const controller = new inquiries_controller_1.InquiriesController();
const inquiriesController = new inquiries_controller_1.InquiriesController();
// مسیرهای ادمین
router.get("/admin/list", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "INQUIRY_MANAGER"]), (req, res) => controller.adminGetAll(req, res));
router.get("/admin/:id", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "INQUIRY_MANAGER"]), (req, res) => controller.adminGetById(req, res));
router.patch("/admin/:id", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "INQUIRY_MANAGER"]), (req, res) => controller.adminUpdate(req, res));
// 👇 مسیر حذف — اصلاح شد (به /admin/:id تغییر کرد)
router.delete("/admin/:id", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "INQUIRY_MANAGER"]), (req, res) => inquiriesController.deleteInquiry(req, res));
// مسیرهای عمومی
router.post("/", (req, res) => controller.create(req, res));
exports.default = router;
