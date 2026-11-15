"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const prisma_1 = require("../../config/prisma");
class SearchService {
    async globalSearch(query) {
        if (!query || query.trim() === "")
            return { articles: [], experiences: [], agencies: [] };
        const searchTerm = query.trim();
        // جستجو در مقالات، سوابق و کارگزاری‌ها به صورت همزمان
        const [articles, experiences, agencies] = await Promise.all([
            prisma_1.prisma.article.findMany({
                where: { title: { contains: searchTerm, mode: "insensitive" } }, // mode: insensitive برای جستجوی حروف بزرگ/کوچک
                take: 5,
                select: { id: true, title: true, status: true },
            }),
            prisma_1.prisma.experience.findMany({
                where: { title: { contains: searchTerm, mode: "insensitive" } },
                take: 5,
                select: { id: true, title: true, organization: true },
            }),
            prisma_1.prisma.agency.findMany({
                where: { name: { contains: searchTerm, mode: "insensitive" } },
                take: 5,
                select: { id: true, name: true, field: true },
            }),
        ]);
        return { articles, experiences, agencies };
    }
}
exports.SearchService = SearchService;
