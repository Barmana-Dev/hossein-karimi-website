import { Hero } from "@/components/home/Hero";
import { ExpertiseCards } from "@/components/home/ExpertiseCards";
import { TimelinePreview } from "@/components/home/TimelinePreview";
import { NetworkPreview } from "@/components/home/NetworkPreview";
import { ArticlesPreview } from "@/components/home/ArticlesPreview";
import { CtaBand } from "@/components/home/CtaBand";
import { HomeSectionNotice } from "@/components/home/HomeSectionNotice";
import { Reveal } from "@/components/ui/Reveal";
import { API_URL } from "@/lib/api";
import { Metadata } from "next";

// export const instant = false;
export const metadata: Metadata = {
  title: "دکتر حسین کریمی | حقوق، امور گمرکی و تجارت",
  description:
    "پایگاه حرفه‌ای معرفی دکتر حسین کریمی؛ مشاور حقوقی، امور گمرکی و تجارت بین‌الملل. مشاهده سوابق، حوزه‌های تخصصی، شبکه کارگزاری‌ها و مقالات تخصصی.",
  openGraph: {
    title: "دکتر حسین کریمی",
    description: "حقوق، امور گمرکی و تجارت بین‌الملل",
    type: "website",
  },
};

//  تعریف تایپ‌های دقیق
interface Expertise {
  id: string;
  title: string;
  slug: string;
  summary: string;
  icon: string;
}

interface Experience {
  id: string;
  slug: string;
  title: string;
  organization: string;
  category: string;
  role: string;
  startDate: string | null;
  endDate: string | null;
}

interface Agency {
  id: string;
  slug: string;
  name: string;
  description: string;
  field: string;
  relationType: string;
  featured: boolean;
}

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
  publishedAt: string | null;
}

interface Settings {
  siteTitle: string;
  subtitle: string;
  biographyShort: string;
  portraitImage: string | null;
}

interface FetchResult<T> {
  data: T | null;
  ok: boolean;
}

// 👇 هیچ خطایی باعث رفتن کل صفحه به صفحهٔ خطا نمی‌شود؛ هر بخش وضعیت خودش را دارد
async function fetchData<T>(url: string): Promise<FetchResult<T>> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error("🔴 API error:", url, res.status);
      return { data: null, ok: false };
    }
    const json = await res.json();
    return { data: (json.data ?? null) as T, ok: true };
  } catch (error) {
    console.error("🔴 API unreachable:", url, error);
    return { data: null, ok: false };
  }
}

async function getData() {
  const [settingsRes, expertiseRes, experienceRes, networkRes, articlesRes] =
    await Promise.all([
      fetchData<Settings>(`${API_URL}/public/settings`),
      fetchData<Expertise[]>(`${API_URL}/public/expertise`),
      fetchData<Experience[]>(`${API_URL}/public/experience`),
      fetchData<Agency[]>(`${API_URL}/public/network`),
      fetchData<Article[]>(`${API_URL}/public/articles`),
    ]);

  return {
    settings: settingsRes.data,
    settingsError: !settingsRes.ok,
    expertises: expertiseRes.data ?? [],
    expertiseError: !expertiseRes.ok,
    experiences: experienceRes.data ?? [],
    experienceError: !experienceRes.ok,
    agencies: networkRes.data ?? [],
    networkError: !networkRes.ok,
    articles: articlesRes.data ?? [],
    articlesError: !articlesRes.ok,
  };
}

export default async function HomePage() {
  const {
    settings,
    settingsError,
    expertises,
    expertiseError,
    experiences,
    experienceError,
    agencies,
    networkError,
    articles,
    articlesError,
  } = await getData();

  const topExperiences = experiences.slice(0, 3);
  const featuredAgencies = agencies
    .filter((a) => a.featured)
    .slice(0, 3);
  const topArticles = articles.slice(0, 3);

  return (
    <>
      <Hero settings={settings} />

      {settingsError && (
        <Reveal>
          <HomeSectionNotice
            title="اطلاعات اصلی سایت بارگذاری نشد"
            message="ارتباط با سرور برقرار نشد. لطفاً از اجرا بودن سرور API مطمئن شوید و دوباره تلاش کنید."
          />
        </Reveal>
      )}

      {expertiseError ? (
        <Reveal>
          <HomeSectionNotice
            title="حوزه‌های تخصصی در دسترس نیست"
            message="دریافت حوزه‌های تخصصی با خطا مواجه شد. دوباره تلاش کنید."
          />
        </Reveal>
      ) : expertises.length > 0 ? (
        <Reveal>
          <ExpertiseCards expertises={expertises} />
        </Reveal>
      ) : (
        <Reveal>
          <HomeSectionNotice
            title="حوزه‌های تخصصی"
            message="هنوز حوزه‌ای منتشر نشده است. محتوا پس از تأیید و انتشار نمایش داده می‌شود."
          />
        </Reveal>
      )}

      {experienceError ? (
        <Reveal>
          <HomeSectionNotice
            title="سوابق حرفه‌ای در دسترس نیست"
            message="دریافت سوابق با خطا مواجه شد. دوباره تلاش کنید."
          />
        </Reveal>
      ) : topExperiences.length > 0 ? (
        <Reveal>
          <TimelinePreview experiences={topExperiences} />
        </Reveal>
      ) : (
        <Reveal>
          <HomeSectionNotice
            title="سوابق حرفه‌ای"
            message="هنوز سابقه‌ای منتشر نشده است. محتوا پس از تأیید و انتشار نمایش داده می‌شود."
          />
        </Reveal>
      )}

      {networkError ? (
        <Reveal>
          <HomeSectionNotice
            title="کارگزاری‌ها در دسترس نیست"
            message="دریافت فهرست کارگزاری‌ها با خطا مواجه شد. دوباره تلاش کنید."
          />
        </Reveal>
      ) : agencies.length > 0 ? (
        <Reveal>
          <NetworkPreview
            agencies={
              featuredAgencies.length > 0
                ? featuredAgencies
                : agencies.slice(0, 3)
            }
          />
        </Reveal>
      ) : (
        <Reveal>
          <HomeSectionNotice
            title="شبکه حرفه‌ای"
            message="هنوز کارگزاری‌ای ثبت نشده است. محتوا پس از تأیید و انتشار نمایش داده می‌شود."
          />
        </Reveal>
      )}

      {articlesError ? (
        <Reveal>
          <HomeSectionNotice
            title="مقالات در دسترس نیست"
            message="دریافت مقالات با خطا مواجه شد. دوباره تلاش کنید."
          />
        </Reveal>
      ) : topArticles.length > 0 ? (
        <Reveal>
          <ArticlesPreview articles={topArticles} />
        </Reveal>
      ) : (
        <Reveal>
          <HomeSectionNotice
            title="مقالات و دیدگاه‌ها"
            message="هنوز مقاله‌ای منتشر نشده است. محتوا پس از تأیید و انتشار نمایش داده می‌شود."
          />
        </Reveal>
      )}

      <Reveal>
        <CtaBand />
      </Reveal>
    </>
  );
}
