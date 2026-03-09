import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  loadConceptCardCached,
  getAllConceptSlugs,
} from "@/lib/concept-loader";
import { CATEGORY_CONFIG } from "@/lib/categories";
import { SITE_NAME, contentUrl, hreflangAlternates } from "@/lib/seo";
import type { Locale } from "@/lib/types";
import { SUPPORTED_LOCALES } from "@/lib/types";

const VALID_LOCALES = new Set(SUPPORTED_LOCALES.map((l) => l.code));

const UI_TEXT: Record<
  Locale,
  {
    concepts: string;
    tryInPlayground: string;
    seeInAction: string;
    expoDocsLink: string;
  }
> = {
  en: {
    concepts: "Concepts",
    tryInPlayground: "Try in Playground",
    seeInAction:
      "See this concept in action with interactive code highlighting",
    expoDocsLink: "Official Expo Documentation",
  },
  es: {
    concepts: "Conceptos",
    tryInPlayground: "Probar en el Playground",
    seeInAction:
      "Ve este concepto en acción con resaltado interactivo de código",
    expoDocsLink: "Documentación Oficial de Expo",
  },
};

export async function generateStaticParams() {
  const slugs = await getAllConceptSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!VALID_LOCALES.has(locale as Locale)) return {};
  const card = await loadConceptCardCached(slug, locale as Locale);
  if (!card) return {};

  const isEs = locale === "es";
  const title = `${card.title} — React Native Tutorial`;
  const description = isEs
    ? `Aprende sobre ${card.title} en React Native con Expo. Tutorial interactivo con ejemplos de código para principiantes.`
    : `Learn about ${card.title} in React Native with Expo. Interactive tutorial with code examples for beginners.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: contentUrl(locale, `/concepts/${slug}`),
      siteName: SITE_NAME,
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: contentUrl(locale, `/concepts/${slug}`),
      languages: hreflangAlternates(`/concepts/${slug}`),
    },
  };
}

interface JsonLd {
  "@context": string;
  "@type": string;
  headline: string;
  description: string;
  inLanguage: string;
  author: { "@type": string; name: string };
  proficiencyLevel: string;
  programmingLanguage: string;
  url: string;
}

function JsonLdScript({ data }: { data: JsonLd }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function ConceptPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!VALID_LOCALES.has(locale as Locale)) notFound();
  const loc = locale as Locale;
  const card = await loadConceptCardCached(slug, loc);
  if (!card) notFound();

  const config = CATEGORY_CONFIG[card.category] ?? CATEGORY_CONFIG.basics;
  const text = UI_TEXT[loc] ?? UI_TEXT.en;

  const jsonLd: JsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: card.title,
    description:
      locale === "es"
        ? `Aprende sobre ${card.title} en React Native con Expo.`
        : `Learn about ${card.title} in React Native with Expo. Interactive tutorial with code examples for beginners.`,
    inLanguage: locale,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    proficiencyLevel: "Beginner",
    programmingLanguage: "TypeScript",
    url: contentUrl(locale, `/concepts/${slug}`),
  };

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 text-sm text-text-tertiary"
        >
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-text-secondary">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/${locale}/concepts`}
                className="hover:text-text-secondary"
              >
                {text.concepts}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span
                className="rounded-md px-1.5 py-0.5 text-xs font-medium capitalize"
                style={{
                  color: `var(${config.cssVar})`,
                  backgroundColor: `color-mix(in srgb, var(${config.cssVar}) 10%, transparent)`,
                }}
              >
                {config.label}
              </span>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-text-primary">{card.title}</li>
          </ol>
        </nav>

        {/* Main content */}
        <article>
          <div className="concept-prose">{card.content}</div>

          {/* CTA to playground */}
          <div className="mt-8 rounded-lg border border-border bg-surface-raised p-6 text-center">
            <p className="mb-3 text-sm text-text-secondary">
              {text.seeInAction}
            </p>
            <Link
              href={`/?concept=${slug}`}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              {text.tryInPlayground}
            </Link>
          </div>

          {/* Expo docs link */}
          <div className="mt-4 text-center">
            <a
              href={card.expoDocUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent hover:text-accent-hover hover:underline"
            >
              {text.expoDocsLink} ↗
            </a>
          </div>
        </article>
      </main>
    </>
  );
}
