"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("./swagger.json"));
const env_1 = require("./config/env");
const prisma_1 = require("./config/prisma");
// ایمپورت مسیرها
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const articles_routes_1 = __importDefault(require("./modules/articles/articles.routes"));
const network_routes_1 = __importDefault(require("./modules/network/network.routes"));
const experience_routes_1 = __importDefault(require("./modules/experience/experience.routes"));
const expertise_routes_1 = __importDefault(require("./modules/expertise/expertise.routes"));
const inquiries_routes_1 = __importDefault(require("./modules/inquiries/inquiries.routes"));
const profile_routes_1 = __importDefault(require("./modules/profile/profile.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/dashboard/dashboard.routes"));
const search_routes_1 = __importDefault(require("./modules/search/search.routes"));
const profile_public_routes_1 = __importDefault(require("./modules/profile/profile.public.routes"));
const media_routes_1 = __importDefault(require("./modules/media/media.routes"));
const app = (0, express_1.default)();
app.disable("x-powered-by");
// 👇 پشت پراکسی (nginx/Cloudflare) برای محدودیت نرخ درخواست لازم است
if (env_1.config.trustProxy > 0) {
    app.set("trust proxy", env_1.config.trustProxy);
}
// ====== هدرهای امنیتی ======
app.use((0, helmet_1.default)({
    // تصاویر آپلودشده از دامنهٔ فرانت‌اند نمایش داده می‌شوند
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // این API صفحهٔ HTML سرو نمی‌کند؛ CSP روی Swagger اعمال نمی‌شود
    contentSecurityPolicy: false,
}));
// ====== تنظیمات CORS ======
app.use((0, cors_1.default)({
    origin(origin, callback) {
        // درخواست‌های بدون Origin (curl یا سرور) مجازند
        if (!origin || env_1.config.corsOrigins.includes(origin)) {
            return callback(null, true);
        }
        // بدون هدر CORS پاسخ می‌دهیم تا مرورگر آن را مسدود کند
        return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}));
// 👇 محدودیت برای لاگین (فقط تلاش‌های ناموفق شمرده می‌شوند)
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: env_1.config.loginRateLimitMax,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            message: "تعداد تلاش‌های ورود بیش از حد مجاز است. لطفاً بعداً تلاش کنید.",
        },
    },
});
app.use("/api/v1/auth/login", loginLimiter);
// 👇 محدودیت کلی API (محافظت در برابر ارسال انبوه درخواست)
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: env_1.config.apiRateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: { message: "تعداد درخواست‌ها بیش از حد مجاز است." },
    },
});
app.use("/api", apiLimiter);
// ====== بدنه و کوکی ======
app.use(express_1.default.json({ limit: "100kb" }));
app.use((0, cookie_parser_1.default)());
// ==================== سلامت سرویس ====================
app.get("/api/health", (req, res) => res.json({ status: "ok", env: env_1.config.appEnv }));
// 👇 بررسی آمادگی دیتابیس (برای استقرار و مانیتورینگ)
app.get("/api/health/db", async (req, res) => {
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        res.json({ status: "ok", database: "up" });
    }
    catch {
        res
            .status(503)
            .json({ status: "error", database: "down", message: "اتصال دیتابیس برقرار نیست." });
    }
});
// ==================== مسیرهای API ====================
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/public/articles", articles_routes_1.default);
app.use("/api/v1/public/network", network_routes_1.default);
app.use("/api/v1/public/experience", experience_routes_1.default);
app.use("/api/v1/public/expertise", expertise_routes_1.default);
app.use("/api/v1/public/inquiries", inquiries_routes_1.default);
app.use("/api/v1/public/media", media_routes_1.default);
app.use("/api/v1/public/settings", profile_public_routes_1.default);
app.use("/api/v1/admin/dashboard", dashboard_routes_1.default);
app.use("/api/v1/admin/search", search_routes_1.default);
app.use("/api/v1/admin/settings", profile_routes_1.default);
// سرو کردن فایل‌های آپلود شده (فقط تصاویر ذخیره می‌شوند)
app.use("/uploads", express_1.default.static(env_1.config.uploadsDir, {
    index: false,
    dotfiles: "ignore",
    maxAge: "7d",
    setHeaders(res) {
        res.setHeader("X-Content-Type-Options", "nosniff");
    },
}));
// ==================== مسیر یافت نشد ====================
app.use((req, res, next) => {
    if (!req.path.startsWith("/api/"))
        return next();
    res.status(404).json({
        success: false,
        error: { message: "این مسیر در API وجود ندارد." },
    });
});
// ==================== مدیریت خطای سراسری ====================
app.use((err, req, res, _next) => {
    let message = "خطای داخلی سرور رخ داده است.";
    let status = 500;
    if (err instanceof Error) {
        message = err.message;
        if ("status" in err && typeof err.status === "number") {
            status = err.status;
        }
    }
    // در پروداکشن جزئیات خطا فقط در لاگ سرور می‌ماند
    if (env_1.config.isProduction) {
        console.error("🔴 Server Error:", err instanceof Error ? err.message : err);
    }
    else {
        console.error("🔴 Server Error:", err instanceof Error ? err.stack : err);
    }
    // در پروداکشن پیام داخلی لو نمی‌رود
    const finalMessage = env_1.config.isProduction
        ? "خطای داخلی سرور رخ داده است."
        : message;
    res.status(status).json({
        success: false,
        error: { message: finalMessage },
    });
});
// ==================== مستندات Swagger ====================
if (env_1.config.enableSwagger) {
    app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default, {
        swaggerOptions: { persistAuthorization: true },
    }));
}
// ==================== اجرای سرور ====================
app.listen(env_1.config.port, () => {
    console.log(`🚀 API [${env_1.config.appEnv}] روی http://localhost:${env_1.config.port} اجرا شد`);
});
exports.default = app;
