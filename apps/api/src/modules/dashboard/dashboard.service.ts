import { prisma } from "../../config/prisma";

// نقش‌هایی که اجازهٔ دیدن اطلاعات درخواست‌دهندگان را دارند
const INQUIRY_VIEWER_ROLES = ["SUPER_ADMIN", "INQUIRY_MANAGER"];

export class DashboardService {
  async getStats(role?: string) {
    const canViewInquiries = !!role && INQUIRY_VIEWER_ROLES.includes(role);

    // 👇 INQUIRY_MANAGER فقط آمار درخواست‌ها رو ببینه (نه مقالات و کارگزاری‌ها)
    if (role === "INQUIRY_MANAGER") {
      const newInquiries = await prisma.inquiry.count({
        where: { status: "new" },
      });

      // 👇 مدیر درخواست‌ها هم باید اعلان درخواست‌های جدید را ببیند؛
      // قبلاً این فهرست خالی بود و زنگ اعلان برای این نقش هیچ‌وقت پر نمی‌شد.
      const recentInquiries = await prisma.inquiry.findMany({
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          id: true,
          fullName: true,
          subject: true,
          status: true,
          createdAt: true,
        },
      });

      return {
        articles: { published: 0, drafts: 0 },
        agencies: { total: 0 },
        inquiries: {
          new: newInquiries,
          recent: recentInquiries,
        },
      };
    }

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
      // 👇 نام و موضوع درخواست‌دهندگان فقط برای نقش‌های مجاز برگردانده می‌شود
      canViewInquiries
        ? prisma.inquiry.findMany({
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
