import path from "node:path";
import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

// 👇 Prisma CLI همان فایل محیطی حالت اجرا را می‌خواند
const appEnv =
  process.env.APP_ENV ??
  (process.env.NODE_ENV === "production" ? "production" : "development");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({
  path: path.resolve(process.cwd(), `.env.${appEnv}`),
  override: true,
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
