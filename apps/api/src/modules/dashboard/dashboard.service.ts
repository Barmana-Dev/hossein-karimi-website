import { prisma } from "../../config/prisma";

export class DashboardService {
  async getStats() {
    // اجرای همزمان کوئری‌ها برای سرعت بیشتر
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
      // دریافت ۴ درخواست آخر برای نمایش در جدول
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
