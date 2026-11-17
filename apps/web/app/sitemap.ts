import { MetadataRoute } from "next";
import { API_URL, SITE_URL } from "@/lib/api";

async function getData() {
  const baseUrl = SITE_URL;
  const apiBase = API_URL;

  const [articlesRes, agenciesRes, expertisesRes, experiencesRes] =
    await Promise.all([
      fetch(`${apiBase}/public/articles`, { cache: "no-store" }).catch(
        () => null,
      ),
      fetch(`${apiBase}/public/network`, { cache: "no-store" }).catch(
        () => null,
      ),
      fetch(`${apiBase}/public/expertise`, { cache: "no-store" }).catch(
        () => null,
      ),
      fetch(`${apiBase}/public/experience`, { cache: "no-store" }).catch(
        () => null,
      ),
    ]);

  const articles = articlesRes?.ok ? (await articlesRes.json()).data : [];
  const agencies = agenciesRes?.ok ? (await agenciesRes.json()).data : [];
  const expertises = expertisesRes?.ok ? (await expertisesRes.json()).data : [];
  const experiences = experiencesRes?.ok
    ? (await experiencesRes.json()).data
    : [];

  return { baseUrl, articles, agencies, expertises, experiences };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { baseUrl, articles, agencies, expertises, experiences } =
    await getData();

  // 👇 صفحات ثابت
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

  type Dated = {
    updatedAt?: string | null;
    publishedAt?: string | null;
    createdAt?: string | null;
  };

  // 👇 آخرین تاریخ واقعی هر رکورد، نه زمان ساخت نقشهٔ سایت
  const lastModifiedOf = (item: Dated): Date => {
    const value = item.updatedAt ?? item.publishedAt ?? item.createdAt;
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date : new Date();
  };

  // 👇 صفحات داینامیک (بدون experience)
  const articlePages = articles.map((article: Dated & { slug: string }) => ({
    url: `${baseUrl}/insights/${article.slug}`,
    lastModified: lastModifiedOf(article),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const agencyPages = agencies.map((agency: Dated & { slug: string }) => ({
    url: `${baseUrl}/network/${agency.slug}`,
    lastModified: lastModifiedOf(agency),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const expertisePages = expertises.map(
    (expertise: Dated & { slug: string }) => ({
      url: `${baseUrl}/expertise/${expertise.slug}`,
      lastModified: lastModifiedOf(expertise),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }),
  );

  const experiencePages = experiences.map(
    (experience: Dated & { slug: string }) => ({
      url: `${baseUrl}/experience/${experience.slug}`,
      lastModified: lastModifiedOf(experience),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }),
  );

  return [
    ...staticPages,
    ...articlePages,
    ...agencyPages,
    ...expertisePages,
    ...experiencePages,
  ];
}
