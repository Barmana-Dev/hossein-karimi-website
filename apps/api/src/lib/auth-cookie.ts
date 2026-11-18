import { Response } from "express";
import { config } from "../config/env";

export const AUTH_COOKIE_NAME = "token";
const AUTH_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // ۱ روز

// 👇 همان تنظیمات برای تنظیم و پاک‌کردن کوکی لازم است؛
// در غیر این صورت clearCookie روی کوکی دارای Domain اثر نمی‌کند.
function authCookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: "strict" as const,
    path: "/",
    ...(config.cookieDomain ? { domain: config.cookieDomain } : {}),
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

export function setAuthCookie(
  res: Response,
  token: string,
  maxAge = AUTH_COOKIE_MAX_AGE,
) {
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions(maxAge));
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME, authCookieOptions());
}
