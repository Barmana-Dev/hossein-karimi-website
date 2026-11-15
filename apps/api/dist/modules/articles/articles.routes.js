"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const articles_controller_1 = require("./articles.controller");
const articles_admin_controller_1 = require("./articles.admin.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const publicController = new articles_controller_1.ArticlesController();
const adminController = new articles_admin_controller_1.ArticlesAdminController();
// ====== ۱. مسیرهای مدیریتی (باید اول باشند) ======
router.get("/admin/list", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "EDITOR"]), (req, res) => adminController.getAll(req, res));
router.post("/admin/create", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "EDITOR"]), (req, res) => adminController.create(req, res));
router.get("/admin/:id", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "EDITOR"]), (req, res) => adminController.getById(req, res));
router.patch("/admin/:id", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "EDITOR"]), (req, res) => adminController.update(req, res));
router.delete("/admin/:id", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "EDITOR"]), (req, res) => adminController.delete(req, res));
// ======  مسیرهای عمومی (بعد از مسیرهای خاص) ======
router.get("/", (req, res) => publicController.getAll(req, res));
router.get("/:slug", (req, res) => publicController.getBySlug(req, res));
exports.default = router;
