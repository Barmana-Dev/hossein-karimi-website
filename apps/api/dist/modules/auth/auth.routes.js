"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_admin_controller_1 = require("./auth.admin.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
const adminAuthController = new auth_admin_controller_1.AuthAdminController();
// ====== ۱. مسیرهای احراز هویت عمومی ======
router.post("/login", (req, res) => authController.login(req, res));
router.post("/logout", (req, res) => authController.logout(req, res));
router.get("/me", auth_middleware_1.requireAuth, (req, res) => authController.getMe(req, res));
router.patch("/me/profile", auth_middleware_1.requireAuth, (req, res) => adminAuthController.updateMyProfile(req, res));
// ====== ۲. مسیرهای مدیریت کاربران (فقط SUPER_ADMIN) ======
// 👇 این مسیرها باید قبل از هر مسیر دیگری که ممکن است با :id تداخل کند، بیایند
router.get("/admin/users", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN"]), (req, res) => adminAuthController.getAllUsers(req, res));
router.post("/admin/users", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN"]), (req, res) => adminAuthController.createUser(req, res));
// 👇 مسیرهای مربوط به یک کاربر خاص (باید بعد از مسیر لیست باشد)
router.get("/admin/users/:id", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN"]), (req, res) => adminAuthController.getUserById(req, res));
router.patch("/admin/users/:id", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN"]), (req, res) => adminAuthController.updateUser(req, res));
router.delete("/admin/users/:id", auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(["SUPER_ADMIN"]), (req, res) => adminAuthController.deleteUser(req, res));
exports.default = router;
