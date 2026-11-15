export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, "");

export function assetUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_ORIGIN}${path}`;
}
