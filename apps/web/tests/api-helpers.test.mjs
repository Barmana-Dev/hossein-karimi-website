import test from "node:test";
import assert from "node:assert/strict";

import {
  assetUrl,
  safeExternalUrl,
  isNextControlFlowError,
  API_URL,
  API_ORIGIN,
  SITE_URL,
} from "../lib/api.ts";

test("assetUrl آدرس‌های نسبی و مطلق را درست می‌سازد", () => {
  assert.equal(assetUrl(null), "");
  assert.equal(assetUrl(undefined), "");

  const relative = assetUrl("/uploads/a.png");
  assert.equal(relative, `${API_ORIGIN}/uploads/a.png`);

  const withoutSlash = assetUrl("uploads/a.png");
  assert.equal(withoutSlash, `${API_ORIGIN}/uploads/a.png`);

  const absolute = "https://cdn.example.com/a.png";
  assert.equal(assetUrl(absolute), absolute);
});

test("safeExternalUrl فقط http و https را می‌پذیرد", () => {
  assert.equal(safeExternalUrl("https://example.com"), "https://example.com/");
  assert.equal(safeExternalUrl("http://example.com/x"), "http://example.com/x");
  assert.equal(safeExternalUrl("javascript:alert(1)"), null);
  assert.equal(safeExternalUrl("data:text/html,<script>alert(1)</script>"), null);
  assert.equal(safeExternalUrl("ftp://example.com"), null);
  assert.equal(safeExternalUrl("example.com"), null);
  assert.equal(safeExternalUrl(""), null);
  assert.equal(safeExternalUrl(null), null);
});

test("isNextControlFlowError خطاهای کنترلی Next را تشخیص می‌دهد", () => {
  assert.equal(isNextControlFlowError({ digest: "DYNAMIC_SERVER_USAGE" }), true);
  assert.equal(isNextControlFlowError({ digest: "NEXT_NOT_FOUND" }), true);
  assert.equal(isNextControlFlowError({ digest: "NEXT_REDIRECT;push;/login" }), true);
  assert.equal(isNextControlFlowError(new Error("network")), false);
  assert.equal(isNextControlFlowError({ digest: 42 }), false);
  assert.equal(isNextControlFlowError(null), false);
});

test("آدرس‌های پایه هیچ اسلش اضافه‌ای در انتها ندارند", () => {
  assert.ok(API_URL.length > 0);
  assert.equal(API_URL.endsWith("/"), false);
  assert.equal(SITE_URL.endsWith("/"), false);
  assert.equal(API_ORIGIN.endsWith("/"), false);
});
