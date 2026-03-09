import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { loadCardsForLocale } from "@/lib/concept-loader";
import { CATEGORY_CONFIG } from "@/lib/categories";
import type { ConceptCategory, Locale } from "@/lib/types";
import { SUPPORTED_LOCALES } from "@/lib/types";
import { SITE_NAME, contentUrl, hreflangAlternates } from "@/lib/seo";

const VALID_LOCALES = new Set(SUPPORTED_LOCALES.map((l) => l.code));

const UI_TEXT: Record<Locale, { heading: string; intro: string }> = {
  en: {
    heading: "React Native Concepts",
    intro:
      "Explore {count} concepts with interactive tutorials. Click any concept to learn more, or",
  },
  es: {
    heading: "Conceptos de React Native",
    intro:
      "Explora {count} conceptos con tutoriales interactivos. Haz clic en cualquier concepto para aprender más, o",
  },
};

const CATEGORY_LABELS: Record<Locale, Record<ConceptCategory, string>> = {
  en: {
    basics: "Basics",
    hooks: "Hooks",
    styling: "Styling",
    events: "Events",
  },
  es: {
    basics: "Fundamentos",
    hooks: "Hooks",
    styling: "Estilos",
    events: "Eventos",
  },
};

const CTA_TEXT: Record<Locale, { tryPlayground: string }> = {
  en: { tryPlayground: "try them in the playground" },
  es: { tryPlayground: "pruébalos en el playground" },
};

const CATEGORY_ORDER: ConceptCategory[] = [
  "basics",
  "hooks",
  "styling",
  "events",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === "es";

  const title = isEs
    ? `Conceptos de React Native — ${SITE_NAME}`
    : `React Native Concepts — ${SITE_NAME}`;
  const description = isEs
    ? "Explora 18 conceptos de React Native y Expo con tutoriales interactivos. Aprende hooks, componentes, estilos y eventos con ejemplos de código."
    : "Browse 18 React Native and Expo concepts with interactive tutorials. Learn hooks, components, styling, and events with code examples.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: contentUrl(locale, "/concepts"),
      siteName: SITE_NAME,
    },
    alternates: {
      canonical: contentUrl(locale, "/concepts"),
      languages: hreflangAlternates("/concepts"),
    },
  };
}

export default async function ConceptsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!VALID_LOCALES.has(locale as Locale)) notFound();
  const loc = locale as Locale;
  // Load English base, overlay locale translations (ensures complete set)
  const enCards = await loadCardsForLocale("en");
  const localeCards = loc !== "en" ? await loadCardsForLocale(loc) : enCards;
  const merged = new Map(enCards);
  for (const [id, card] of localeCards) {
    merged.set(id, card);
  }
  const cards = Array.from(merged.values());
  const text = UI_TEXT[loc] ?? UI_TEXT.en;
  const catLabels = CATEGORY_LABELS[loc] ?? CATEGORY_LABELS.en;
  const cta = CTA_TEXT[loc] ?? CTA_TEXT.en;

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    config: CATEGORY_CONFIG[cat],
    label: catLabels[cat],
    cards: cards
      .filter((c) => c.category === cat)
      .sort((a, b) => a.order - b.order),
  }));

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-gray-700">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-gray-900">
            {locale === "es" ? "Conceptos" : "Concepts"}
          </li>
        </ol>
      </nav>

      <h1 className="mb-2 text-2xl font-bold text-gray-900">{text.heading}</h1>
      <p className="mb-8 text-gray-600">
        {text.intro.replace("{count}", String(cards.length))}{" "}
        <Link href="/" className="text-blue-600 hover:underline">
          {cta.tryPlayground}
        </Link>
        .
      </p>

      <div className="space-y-8">
        {grouped.map(({ category, config, label, cards: catCards }) => (
          <section key={category}>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: `var(${config.cssVar})` }}
              />
              {label}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {catCards.map((card) => (
                <Link
                  key={card.id}
                  href={`/${locale}/concepts/${card.id}`}
                  className="group rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                    {card.title}
                  </h3>
                  <span className="mt-1 text-sm text-gray-500">{label}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
