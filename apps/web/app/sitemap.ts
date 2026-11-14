import { MetadataRoute } from "next";

// تابع دریافت داده‌ها از بک‌اند
async function getData() {
  const baseUrl = "https://hosseinkarimi.com";

  const [articlesRes, experiencesRes, agenciesRes, expertisesRes] =
    await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1/public"}/articles`,
        { cache: "no-store" },
      ).catch(() => null),
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1/public"}/experience`,
        { cache: "no-store" },
      ).catch(() => null),
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1/public"}/network`,
        { cache: "no-store" },
      ).catch(() => null),
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1/public"}/expertise`,
        { cache: "no-store" },
      ).catch(() => null),
    ]);

  const articles = articlesRes?.ok ? (await articlesRes.json()).data : [];
  const experiences = experiencesRes?.ok
    ? (await experiencesRes.json()).data
    : [];
  const agencies = agenciesRes?.ok ? (await agenciesRes.json()).data : [];
  const expertises = expertisesRes?.ok ? (await expertisesRes.json()).data : [];

  return { baseUrl, articles, experiences, agencies, expertises };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { baseUrl, articles, experiences, agencies, expertises } =
    await getData();

  // صفحات ثابت
  const staticPages = [
    "",
    "/about",
    "/experience",
    "/expertise",
    "/network",
    "/insights",
    "/media",
    "/contact",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // صفحات داینامیک
  const articlePages = articles.map((article: { slug: string }) => ({
    url: `${baseUrl}/insights/${article.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const experiencePages = experiences.map((exp: { slug: string }) => ({
    url: `${baseUrl}/experience/${exp.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const agencyPages = agencies.map((agency: { slug: string }) => ({
    url: `${baseUrl}/network/${agency.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const expertisePages = expertises.map((expertise: { slug: string }) => ({
    url: `${baseUrl}/expertise/${expertise.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...articlePages,
    ...experiencePages,
    ...agencyPages,
    ...expertisePages,
  ];
}
