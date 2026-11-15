"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const network_controller_1 = require("./network.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const controller = new network_controller_1.NetworkController();
// ====== ۱. مسیرهای مدیریتی ======
router.get("/admin/list", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "EDITOR"]), (req, res) => controller.adminGetAll(req, res));
router.post("/admin/create", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "EDITOR"]), (req, res) => controller.adminCreate(req, res));
router.get("/admin/:id", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "EDITOR"]), (req, res) => controller.adminGetById(req, res));
router.patch("/admin/:id", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "EDITOR"]), (req, res) => controller.adminUpdate(req, res));
router.delete("/admin/:id", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN", "EDITOR"]), (req, res) => controller.adminDelete(req, res));
// ====== ۲. مسیرهای عمومی ======
router.get("/", (req, res) => controller.getAll(req, res));
router.get("/:slug", (req, res) => controller.getBySlug(req, res));
exports.default = router;
