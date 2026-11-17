"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const prisma_1 = require("../../config/prisma");
// نقش‌هایی که اجازهٔ دیدن اطلاعات درخواست‌دهندگان را دارند
const INQUIRY_VIEWER_ROLES = ["SUPER_ADMIN", "INQUIRY_MANAGER"];
class DashboardService {
    async getStats(role) {
        const canViewInquiries = !!role && INQUIRY_VIEWER_ROLES.includes(role);
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
        const [publishedArticles, draftArticles, newInquiries, totalAgencies, recentInquiries,] = await Promise.all([
            prisma_1.prisma.article.count({ where: { status: "published" } }),
            prisma_1.prisma.article.count({ where: { status: "draft" } }),
            prisma_1.prisma.inquiry.count({ where: { status: "new" } }),
            prisma_1.prisma.agency.count(),
            // 👇 نام و موضوع درخواست‌دهندگان فقط برای نقش‌های مجاز برگردانده می‌شود
            canViewInquiries
                ? prisma_1.prisma.inquiry.findMany({
                    orderBy: { createdAt: "desc" },
                    take: 4,
                    select: {
                        id: true,
                        fullName: true,
                        subject: true,
                        status: true,
                        createdAt: true,
                    },
                })
                : Promise.resolve([]),
        ]);
        return {
            articles: { published: publishedArticles, drafts: draftArticles },
            inquiries: { new: newInquiries, recent: recentInquiries },
            agencies: { total: totalAgencies },
        };
    }
}
exports.DashboardService = DashboardService;
