import { Hero } from "@/components/home/Hero";
import { ExpertiseCards } from "@/components/home/ExpertiseCards";
import { TimelinePreview } from "@/components/home/TimelinePreview";
import { NetworkPreview } from "@/components/home/NetworkPreview";
import { ArticlesPreview } from "@/components/home/ArticlesPreview";
import { CtaBand } from "@/components/home/CtaBand";
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
  portraitImage: string;
}

async function getData() {
  const [settingsRes, expertiseRes, experienceRes, networkRes, articlesRes] =
    await Promise.all([
      fetch(`${API_URL}/public/settings`, {
        cache: "no-store",
      }),
      fetch(`${API_URL}/public/expertise`, {
        cache: "no-store",
      }),
      fetch(`${API_URL}/public/experience`, {
        cache: "no-store",
      }),
      fetch(`${API_URL}/public/network`, {
        cache: "no-store",
      }),
      fetch(`${API_URL}/public/articles`, {
        cache: "no-store",
      }),
    ]);

  let settings: Settings | null = null;
  if (settingsRes.ok) {
    settings = (await settingsRes.json()).data;
  } else {
    console.error("🔴 Error fetching settings:", settingsRes.status);
  }

  //  استفاده از تایپ‌های دقیق
  const expertises: Expertise[] = expertiseRes.ok
    ? (await expertiseRes.json()).data
    : [];
  const experiences: Experience[] = experienceRes.ok
    ? (await experienceRes.json()).data
    : [];
  const agencies: Agency[] = networkRes.ok
    ? (await networkRes.json()).data
    : [];
  const articles: Article[] = articlesRes.ok
    ? (await articlesRes.json()).data
    : [];

  return { settings, expertises, experiences, agencies, articles };
}

export default async function HomePage() {
  const { settings, expertises, experiences, agencies, articles } =
    await getData();

  const topExperiences = experiences.slice(0, 3);
  const featuredAgencies = agencies
    .filter((a) => a.featured) //  دیگر نیازی به تایپ صریح نیست
    .slice(0, 3);
  const topArticles = articles.slice(0, 3);

  return (
    <>
      <Hero settings={settings} />

      <Reveal>
        <ExpertiseCards expertises={expertises} />
      </Reveal>
      <Reveal>
        <TimelinePreview experiences={topExperiences} />
      </Reveal>
      <Reveal>
        <NetworkPreview
          agencies={
            featuredAgencies.length > 0
              ? featuredAgencies
              : agencies.slice(0, 3)
          }
        />
      </Reveal>
      <Reveal>
        <ArticlesPreview articles={topArticles} />
      </Reveal>
      <Reveal>
        <CtaBand />
      </Reveal>
    </>
  );
}
