import { Request } from "express";

export interface PageParams {
  /** آیا درخواست صفحه‌بندی‌شده است؟ (اگر page ارسال نشود، لیست کامل برمی‌گردد) */
  paginated: boolean;
  page: number;
  limit: number;
  skip: number;
  search: string;
  status: string | null;
  type: string | null;
}

export interface PageQuery {
  skip?: number;
  take?: number;
  search?: string;
  status?: string;
  type?: string;
}

export const MAX_PAGE_SIZE = 100;

export function getPageParams(req: Request, defaultLimit = 10): PageParams {
  const rawPage = Number(req.query.page);
  const paginated = Number.isFinite(rawPage) && rawPage > 0;

  const rawLimit = Number(req.query.limit);
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.floor(rawLimit), MAX_PAGE_SIZE)
      : defaultLimit;

  const page = paginated ? Math.floor(rawPage) : 1;
  const search =
    typeof req.query.q === "string" ? req.query.q.trim().slice(0, 100) : "";
  const rawStatus = req.query.status;
  const status =
    typeof rawStatus === "string" && rawStatus !== "" && rawStatus !== "all"
      ? rawStatus
      : null;
  const rawType = req.query.type;
  const type =
    typeof rawType === "string" && rawType !== "" && rawType !== "all"
      ? rawType
      : null;

  return {
    paginated,
    page,
    limit,
    skip: (page - 1) * limit,
    search,
    status,
    type,
  };
}

export function buildMeta(total: number, page: number, limit: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
