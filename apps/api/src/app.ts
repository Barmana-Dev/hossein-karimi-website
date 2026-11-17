import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";

import { config } from "./config/env";
import { prisma } from "./config/prisma";

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
import mediaRoutes from "./modules/media/media.routes";

const app = express();

app.disable("x-powered-by");

// 👇 پشت پراکسی (nginx/Cloudflare) برای محدودیت نرخ درخواست لازم است
if (config.trustProxy > 0) {
  app.set("trust proxy", config.trustProxy);
}

// ====== هدرهای امنیتی ======
app.use(
  helmet({
    // تصاویر آپلودشده از دامنهٔ فرانت‌اند نمایش داده می‌شوند
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // این API صفحهٔ HTML سرو نمی‌کند؛ CSP روی Swagger اعمال نمی‌شود
    contentSecurityPolicy: false,
  }),
);

// ====== تنظیمات CORS ======
app.use(
  cors({
    origin(origin, callback) {
      // درخواست‌های بدون Origin (curl یا سرور) مجازند
      if (!origin || config.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      // بدون هدر CORS پاسخ می‌دهیم تا مرورگر آن را مسدود کند
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
);

// 👇 محدودیت برای لاگین (فقط تلاش‌های ناموفق شمرده می‌شوند)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.loginRateLimitMax,
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
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.apiRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: "تعداد درخواست‌ها بیش از حد مجاز است." },
  },
});
app.use("/api", apiLimiter);

// ====== بدنه و کوکی ======
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

// ==================== سلامت سرویس ====================
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", env: config.appEnv }),
);

// 👇 بررسی آمادگی دیتابیس (برای استقرار و مانیتورینگ)
app.get("/api/health/db", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "up" });
  } catch {
    res
      .status(503)
      .json({ status: "error", database: "down", message: "اتصال دیتابیس برقرار نیست." });
  }
});

// ==================== مسیرهای API ====================
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/public/articles", articlesRoutes);
app.use("/api/v1/public/network", networkRoutes);
app.use("/api/v1/public/experience", experienceRoutes);
app.use("/api/v1/public/expertise", expertiseRoutes);
app.use("/api/v1/public/inquiries", inquiriesRoutes);
app.use("/api/v1/public/media", mediaRoutes);
app.use("/api/v1/public/settings", profilePublicRoutes);

app.use("/api/v1/admin/dashboard", dashboardRoutes);
app.use("/api/v1/admin/search", searchRoutes);
app.use("/api/v1/admin/settings", profileRoutes);

// سرو کردن فایل‌های آپلود شده (فقط تصاویر ذخیره می‌شوند)
app.use(
  "/uploads",
  express.static(config.uploadsDir, {
    index: false,
    dotfiles: "ignore",
    maxAge: "7d",
    setHeaders(res) {
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  }),
);

// ==================== مسیر یافت نشد ====================
app.use((req: Request, res: Response, next: NextFunction) => {
  if (!req.path.startsWith("/api/")) return next();
  res.status(404).json({
    success: false,
    error: { message: "این مسیر در API وجود ندارد." },
  });
});

// ==================== مدیریت خطای سراسری ====================
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  let message = "خطای داخلی سرور رخ داده است.";
  let status = 500;

  if (err instanceof Error) {
    message = err.message;
    if ("status" in err && typeof (err as { status: unknown }).status === "number") {
      status = (err as { status: number }).status;
    }
  }

  // در پروداکشن جزئیات خطا فقط در لاگ سرور می‌ماند
  if (config.isProduction) {
    console.error("🔴 Server Error:", err instanceof Error ? err.message : err);
  } else {
    console.error(
      "🔴 Server Error:",
      err instanceof Error ? err.stack : err,
    );
  }

  // در پروداکشن پیام داخلی لو نمی‌رود
  const finalMessage = config.isProduction
    ? "خطای داخلی سرور رخ داده است."
    : message;

  res.status(status).json({
    success: false,
    error: { message: finalMessage },
  });
});

// ==================== مستندات Swagger ====================
if (config.enableSwagger) {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      swaggerOptions: { persistAuthorization: true },
    }),
  );
}

// ==================== اجرای سرور ====================
app.listen(config.port, () => {
  console.log(
    `🚀 API [${config.appEnv}] روی http://localhost:${config.port} اجرا شد`,
  );
});

export default app;
