import type { MetadataRoute } from "next";
import { getAllConceptSlugs } from "@/lib/concept-loader";
import { SITE_URL, contentUrl, hreflangAlternates } from "@/lib/seo";
import { SUPPORTED_LOCALES } from "@/lib/types";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllConceptSlugs();
  const locales = SUPPORTED_LOCALES.map(({ code }) => code);
  const now = new Date();

  const indexPages: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: contentUrl(locale, "/concepts"),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
    alternates: { languages: hreflangAlternates("/concepts") },
  }));

  const conceptPages: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    slugs.map((slug) => ({
      url: contentUrl(locale, `/concepts/${slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      alternates: { languages: hreflangAlternates(`/concepts/${slug}`) },
    }))
  );

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...indexPages,
    ...conceptPages,
  ];
}
