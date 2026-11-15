"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const prisma_1 = require("../../config/prisma");
class DashboardService {
    async getStats(role) {
        // 👇 INQUIRY_MANAGER فقط آمار درخواست‌ها رو ببینه (نه مقالات و کارگزاری‌ها)
        if (role === "INQUIRY_MANAGER") {
            const newInquiries = await prisma_1.prisma.inquiry.count({
                where: { status: "new" },
            });
            return {
                articles: { published: 0, drafts: 0 },
                agencies: { total: 0 },
                inquiries: {
                    new: newInquiries,
                    recent: [], // 👈 خالی! چون INQUIRY_MANAGER از صفحه /admin/inquiries جزئیات رو می‌بینه
                },
            };
        }
        // SUPER_ADMIN و EDITOR همه چیز رو ببینن
        const [publishedArticles, draftArticles, newInquiries, totalAgencies, recentInquiries,] = await Promise.all([
            prisma_1.prisma.article.count({ where: { status: "published" } }),
            prisma_1.prisma.article.count({ where: { status: "draft" } }),
            prisma_1.prisma.inquiry.count({ where: { status: "new" } }),
            prisma_1.prisma.agency.count(),
            prisma_1.prisma.inquiry.findMany({
                orderBy: { createdAt: "desc" },
                take: 4,
                select: {
                    id: true,
                    fullName: true,
                    subject: true,
                    status: true,
                    createdAt: true,
                },
            }),
        ]);
        return {
            articles: { published: publishedArticles, drafts: draftArticles },
            inquiries: { new: newInquiries, recent: recentInquiries },
            agencies: { total: totalAgencies },
        };
    }
}
exports.DashboardService = DashboardService;
