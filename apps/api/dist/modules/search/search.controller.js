"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchController = void 0;
const search_service_1 = require("./search.service");
const searchService = new search_service_1.SearchService();
const MAX_QUERY_LENGTH = 100;
class SearchController {
    async search(req, res) {
        try {
            const rawQuery = typeof req.query.q === "string" ? req.query.q : "";
            const query = rawQuery.slice(0, MAX_QUERY_LENGTH);
            const results = await searchService.globalSearch(query);
            res.json({ success: true, data: results });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "خطا";
            res.status(500).json({ success: false, error: { message } });
        }
    }
}
exports.SearchController = SearchController;
