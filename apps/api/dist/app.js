"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const media_routes_1 = __importDefault(require("./modules/media/media.routes"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("./swagger.json"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
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
const inquiries_routes_2 = __importDefault(require("./modules/inquiries/inquiries.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// ====== تنظیمات CORS ======
app.use((0, cors_1.default)({
    origin: "http://localhost:3000", // آدرس دقیق فرانت‌اند (بدون ستاره)
    credentials: true, // اجازه ارسال کوکی
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}));
// 👇 محدودیت برای فرم تماس (حداکثر ۵ درخواست در ۱۵ دقیقه)
const inquiryLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 دقیقه
    max: process.env.NODE_ENV === "production" ? 5 : 100, // حداکثر 5 درخواست
    message: {
        success: false,
        error: {
            message: "تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً بعداً تلاش کنید.",
        },
    },
});
// 👇 محدودیت برای لاگین (حداکثر ۱۰ تلاش در ۱۵ دقیقه)
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "production" ? 10 : 100,
    message: {
        success: false,
        error: {
            message: "تعداد تلاش‌های ورود بیش از حد مجاز است. لطفاً بعداً تلاش کنید.",
        },
    },
});
// اعمال محدودیت‌ها
app.use("/api/v1/public/inquiries", inquiryLimiter);
app.use("/api/v1/auth/login", loginLimiter);
// 👇 تنظیمات امنیتی برای نمایش عکس‌ها (بدون تداخل با CORS)
app.use((req, res, next) => {
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
});
// ۳. محدودیت حجم داده ارسالی (جلوگیری از حملات DOS)
app.use(express_1.default.json({ limit: "100kb" }));
// ۴. پشتیبانی از کوکی‌ها
app.use((0, cookie_parser_1.default)());
// ==================== مسیرهای API ====================
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/public/articles", articles_routes_1.default);
app.use("/api/v1/public/network", network_routes_1.default);
app.use("/api/v1/public/experience", experience_routes_1.default);
app.use("/api/v1/public/expertise", expertise_routes_1.default);
app.use("/api/v1/public/inquiries", inquiries_routes_1.default);
app.use("/api/v1/admin/dashboard", dashboard_routes_1.default);
app.use("/api/v1/admin/search", search_routes_1.default);
app.use("/api/v1", inquiries_routes_2.default);
// مسیر مدیریتی (برای پنل ادمین)
app.use("/api/v1/admin/settings", profile_routes_1.default);
app.use("/api/v1/public/settings", profile_public_routes_1.default);
// سرو کردن فایل‌های آپلود شده
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
app.use("/api/v1/public/media", media_routes_1.default);
// ==================== مدیریت خطای سراسری ====================
app.use((err, req, res, next) => {
    // چون err از نوع unknown است، باید بررسی کنیم که آیا یک Error است یا نه
    let message = "خطای داخلی سرور رخ داده است.";
    let status = 500;
    if (err instanceof Error) {
        message = err.message;
        // اگر خطای ما پراپرتی status داشت (مثل خطاهای HTTP)
        if ("status" in err) {
            status = err.status;
        }
    }
    console.error("🔴 Server Error:", message); // لاگ کردن برای توسعه‌دهنده
    // در محیط production پیام امن‌تر ارسال می‌شود
    const finalMessage = process.env.NODE_ENV === "production"
        ? "خطای داخلی سرور رخ داده است."
        : message;
    res.status(status).json({
        success: false,
        error: { message: finalMessage },
    });
});
// ==================== تنظیمات Swagger ====================
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API سایت دکتر حسین کریمی",
            version: "1.0.0",
            description: "مستندات APIهای عمومی و مدیریتی سایت شخصی دکتر حسین کریمی",
        },
        servers: [
            {
                url: "http://localhost:4000",
                description: "سرور توسعه (Local)",
            },
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "token",
                },
            },
        },
    },
    // مسیر فایل‌هایی که کامنت‌های Swagger در آن‌ها قرار دارد
    apis: ["./src/modules/**/*.routes.ts"],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
// مسیر دسترسی به مستندات
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
// مسیر دسترسی به مستندات
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
// ==================== اجرای سرور ====================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
