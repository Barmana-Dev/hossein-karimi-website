export type Status = "draft" | "review" | "published";

export interface SiteSettings {
  siteTitle: string;
  subtitle: string;
  biographyShort: string;
  contactEmail: string;
  phone: string;
  socials: { platform: string; url: string }[];
}

export interface Experience {
  id: string;
  title: string;
  organization: string;
  category: "legal" | "customs" | "management" | "education" | "business";
  role: string;
  startDate: string | null;
  endDate: string | null;
  description: string;
  sourceUrl: string | null;
  status: Status;
  slug: string;
}

export interface Expertise {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  icon: string;
  status: Status;
}

export interface Agency {
  id: string;
  name: string;
  slug: string;
  description: string;
  field: string;
  relationType: string;
  relationDescription: string;
  city: string | null;
  websiteUrl: string | null;
  featured: boolean;
  status: Status;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  authorName: string;
  category: string;
  publishedAt: string;
  readTime: number;
  status: Status;
}

export interface MediaItem {
  id: string;
  type: "news" | "interview" | "speech" | "event" | "video";
  title: string;
  description: string;
  sourceUrl: string | null;
  happenedAt: string;
  status: Status;
}
