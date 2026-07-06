import type { MetadataRoute } from "next";

import { blogPosts, projects } from "@/lib/content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/chat`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    ...projects.map((p) => ({
      url: `${SITE_URL}/projects/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...blogPosts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
