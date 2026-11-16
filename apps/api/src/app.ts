import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import mediaRoutes from "./modules/media/media.routes";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";
import rateLimit from "express-rate-limit";

// ایمپورت مسیرها
import authRoutes from "./modules/auth/auth.routes";
import articlesRoutes from "./modules/articles/articles.routes";
import networkRoutes from "./modules/network/network.routes";
import experienceRoutes from "./modules/experience/experience.routes";
import expertiseRoutes from "./modules/expertise/expertise.routes";
import inquiriesRoutes from "./modules/inquiries/inquiries.routes";
import profileRoutes from "./modules/profile/profile.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import searchRoutes from "./modules/search/search.routes";
import profilePublicRoutes from "./modules/profile/profile.public.routes";

dotenv.config();

const app = express();

// ====== تنظیمات CORS ======
// دامنه‌های مجاز از متغیر محیطی CORS_ORIGINS خوانده می‌شوند (با کاما جدا می‌شوند)
const allowedOrigins = (
  process.env.CORS_ORIGINS || "http://localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // درخواست‌های بدون Origin (مثل curl یا سرور) مجازند
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // بدون هدر CORS پاسخ می‌دهیم تا مرورگر آن را مسدود کند
      return callback(null, false);
    },
    credentials: true, // اجازه ارسال کوکی
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
);

// 👇 محدودیت برای لاگین (حداکثر ۱۰ تلاش در ۱۵ دقیقه)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 10 : 100,
  message: {
    success: false,
    error: {
      message: "تعداد تلاش‌های ورود بیش از حد مجاز است. لطفاً بعداً تلاش کنید.",
    },
  },
});

// اعمال محدودیت‌ها (محدودیت فرم تماس روی خودِ endpoint ثبت درخواست اعمال می‌شود)
app.use("/api/v1/auth/login", loginLimiter);

// 👇 تنظیمات امنیتی برای نمایش عکس‌ها (بدون تداخل با CORS)
app.use((req, res, next) => {
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// ۳. محدودیت حجم داده ارسالی (جلوگیری از حملات DOS)
app.use(express.json({ limit: "100kb" }));

// ۴. پشتیبانی از کوکی‌ها
app.use(cookieParser());

// ==================== مسیرهای API ====================
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/public/articles", articlesRoutes);
app.use("/api/v1/public/network", networkRoutes);
app.use("/api/v1/public/experience", experienceRoutes);
app.use("/api/v1/public/expertise", expertiseRoutes);
app.use("/api/v1/public/inquiries", inquiriesRoutes);
app.use("/api/v1/admin/dashboard", dashboardRoutes);
app.use("/api/v1/admin/search", searchRoutes);
// مسیر مدیریتی (برای پنل ادمین)
app.use("/api/v1/admin/settings", profileRoutes);

app.use("/api/v1/public/settings", profilePublicRoutes);

// سرو کردن فایل‌های آپلود شده
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/v1/public/media", mediaRoutes);

// ==================== مدیریت خطای سراسری ====================
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  // چون err از نوع unknown است، باید بررسی کنیم که آیا یک Error است یا نه
  let message = "خطای داخلی سرور رخ داده است.";
  let status = 500;

  if (err instanceof Error) {
    message = err.message;
    // اگر خطای ما پراپرتی status داشت (مثل خطاهای HTTP)
    if ("status" in err) {
      status = (err as { status: number }).status;
    }
  }

  console.error("🔴 Server Error:", message); // لاگ کردن برای توسعه‌دهنده

  // در محیط production پیام امن‌تر ارسال می‌شود
  const finalMessage =
    process.env.NODE_ENV === "production"
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

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// مسیر دسترسی به مستندات
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// مسیر دسترسی به مستندات
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ==================== اجرای سرور ====================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
