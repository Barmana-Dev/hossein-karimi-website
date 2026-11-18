"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchController = void 0;
const error_message_1 = require("../../lib/error-message");
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
            const message = (0, error_message_1.publicErrorMessage)(error, "خطا");
            res.status(500).json({ success: false, error: { message } });
        }
    }
}
exports.SearchController = SearchController;
