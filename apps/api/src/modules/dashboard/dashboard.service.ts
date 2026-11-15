import { prisma } from "../../config/prisma";

export class DashboardService {
  async getStats(role?: string) {
    // 👇 INQUIRY_MANAGER فقط آمار درخواست‌ها رو ببینه (نه مقالات و کارگزاری‌ها)
    if (role === "INQUIRY_MANAGER") {
      const newInquiries = await prisma.inquiry.count({
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
    const [
      publishedArticles,
      draftArticles,
      newInquiries,
      totalAgencies,
      recentInquiries,
    ] = await Promise.all([
      prisma.article.count({ where: { status: "published" } }),
      prisma.article.count({ where: { status: "draft" } }),
      prisma.inquiry.count({ where: { status: "new" } }),
      prisma.agency.count(),
      prisma.inquiry.findMany({
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
