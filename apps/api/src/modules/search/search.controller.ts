import { Request, Response } from "express";
import { SearchService } from "./search.service";

const searchService = new SearchService();

export class SearchController {
  async search(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      const results = await searchService.globalSearch(query);
      res.json({ success: true, data: results });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطا";
      res.status(500).json({ success: false, error: { message } });
    }
  }
}
