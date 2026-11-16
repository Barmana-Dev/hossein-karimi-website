import { MetadataRoute } from "next";
import { API_URL, SITE_URL } from "@/lib/api";

async function getData() {
  const baseUrl = SITE_URL;
  const apiBase = API_URL;

  const [articlesRes, agenciesRes, expertisesRes] = await Promise.all([
    fetch(`${apiBase}/public/articles`, { cache: "no-store" }).catch(() => null),
    fetch(`${apiBase}/public/network`, { cache: "no-store" }).catch(() => null),
    fetch(`${apiBase}/public/expertise`, { cache: "no-store" }).catch(
      () => null,
    ),
  ]);

  const articles = articlesRes?.ok ? (await articlesRes.json()).data : [];
  const agencies = agenciesRes?.ok ? (await agenciesRes.json()).data : [];
  const expertises = expertisesRes?.ok ? (await expertisesRes.json()).data : [];

  return { baseUrl, articles, agencies, expertises };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { baseUrl, articles, agencies, expertises } = await getData();

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

  // 👇 صفحات داینامیک (بدون experience)
  const articlePages = articles.map((article: { slug: string }) => ({
    url: `${baseUrl}/insights/${article.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
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

  return [...staticPages, ...articlePages, ...agencyPages, ...expertisePages];
}
