import { prisma } from "../../config/prisma";

export class SearchService {
  async globalSearch(query: string) {
    if (!query || query.trim() === "")
      return { articles: [], experiences: [], agencies: [] };

    const searchTerm = query.trim();

    // جستجو در مقالات، سوابق و کارگزاری‌ها به صورت همزمان
    const [articles, experiences, agencies] = await Promise.all([
      prisma.article.findMany({
        where: { title: { contains: searchTerm, mode: "insensitive" } }, // mode: insensitive برای جستجوی حروف بزرگ/کوچک
        take: 5,
        select: { id: true, title: true, status: true },
      }),
      prisma.experience.findMany({
        where: { title: { contains: searchTerm, mode: "insensitive" } },
        take: 5,
        select: { id: true, title: true, organization: true },
      }),
      prisma.agency.findMany({
        where: { name: { contains: searchTerm, mode: "insensitive" } },
        take: 5,
        select: { id: true, name: true, field: true },
      }),
    ]);

    return { articles, experiences, agencies };
  }
}
