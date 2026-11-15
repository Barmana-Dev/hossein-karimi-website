import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthAdminController } from "./auth.admin.controller";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { AuthRequest } from "../../middleware/auth.middleware";

const router = Router();
const authController = new AuthController();
const adminAuthController = new AuthAdminController();

// ====== ۱. مسیرهای احراز هویت عمومی ======
router.post("/login", (req, res) => authController.login(req, res));
router.post("/logout", (req, res) => authController.logout(req, res));
router.get("/me", requireAuth, (req, res) =>
  authController.getMe(req as AuthRequest, res),
);

router.patch("/me/profile", requireAuth, (req, res) =>
  adminAuthController.updateMyProfile(req as AuthRequest, res),
);

// ====== ۲. مسیرهای مدیریت کاربران (فقط SUPER_ADMIN) ======
// 👇 این مسیرها باید قبل از هر مسیر دیگری که ممکن است با :id تداخل کند، بیایند
router.get(
  "/admin/users",
  requireAuth,
  requireRole(["SUPER_ADMIN"]),
  (req, res) => adminAuthController.getAllUsers(req as AuthRequest, res),
);
router.post(
  "/admin/users",
  requireAuth,
  requireRole(["SUPER_ADMIN"]),
  (req, res) => adminAuthController.createUser(req as AuthRequest, res),
);

// 👇 مسیرهای مربوط به یک کاربر خاص (باید بعد از مسیر لیست باشد)
router.get(
  "/admin/users/:id",
  requireAuth,
  requireRole(["SUPER_ADMIN"]),
  (req, res) => adminAuthController.getUserById(req as AuthRequest, res),
);
router.patch(
  "/admin/users/:id",
  requireAuth,
  requireRole(["SUPER_ADMIN"]),
  (req, res) => adminAuthController.updateUser(req as AuthRequest, res),
);

router.delete(
  "/admin/users/:id",
  requireAuth,
  requireRole(["SUPER_ADMIN"]),
  (req, res) => adminAuthController.deleteUser(req as AuthRequest, res),
);

export default router;
