import { Request, Response } from "express";
import { SearchService } from "./search.service";

const searchService = new SearchService();
const MAX_QUERY_LENGTH = 100;

export class SearchController {
  async search(req: Request, res: Response) {
    try {
      const rawQuery = typeof req.query.q === "string" ? req.query.q : "";
      const query = rawQuery.slice(0, MAX_QUERY_LENGTH);
      const results = await searchService.globalSearch(query);
      res.json({ success: true, data: results });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطا";
      res.status(500).json({ success: false, error: { message } });
    }
  }
}
