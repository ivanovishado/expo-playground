import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { ConceptCard, ConceptCategory, Locale } from "@/lib/types";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/types";

interface ConceptFrontmatter {
  id: string;
  title: string;
  category: ConceptCategory;
  order: number;
  expoDocUrl: string;
}

const CONCEPTS_DIR = join(process.cwd(), "content", "concepts");

export async function loadConceptCard(
  id: string,
  locale: Locale = DEFAULT_LOCALE
): Promise<ConceptCard | null> {
  try {
    const filePath = join(CONCEPTS_DIR, locale, `${id}.mdx`);
    const source = await readFile(filePath, "utf-8");

    const { content, frontmatter } = await compileMDX<ConceptFrontmatter>({
      source,
      options: {
        parseFrontmatter: true,
        mdxOptions: { remarkPlugins: [remarkGfm] },
      },
    });

    return {
      id: frontmatter.id,
      title: frontmatter.title,
      category: frontmatter.category,
      order: frontmatter.order,
      expoDocUrl: frontmatter.expoDocUrl,
      content,
    };
  } catch {
    return null;
  }
}

async function loadCardsForLocale(
  locale: Locale
): Promise<Map<string, ConceptCard>> {
  const cards = new Map<string, ConceptCard>();
  const localeDir = join(CONCEPTS_DIR, locale);

  let files: string[];
  try {
    files = await readdir(localeDir);
  } catch {
    return cards;
  }

  const mdxFiles = files.filter((f) => f.endsWith(".mdx"));

  const results = await Promise.all(
    mdxFiles.map((file) => {
      const id = file.replace(/\.mdx$/, "");
      return loadConceptCard(id, locale);
    })
  );

  for (const card of results) {
    if (card) {
      cards.set(card.id, card);
    }
  }

  return cards;
}

/**
 * Loads concept cards for all supported locales.
 * Uses English as the base — non-English locales overlay their translations
 * on top of a clone of the English map, so every locale is guaranteed complete.
 */
export async function loadAllConceptCardsByLocale(): Promise<
  Record<Locale, ConceptCard[]>
> {
  const allCards = await Promise.all(
    SUPPORTED_LOCALES.map(async ({ code }) => {
      const cards = await loadCardsForLocale(code);
      return [code, cards] as const;
    })
  );

  const enMap = allCards.find(([code]) => code === "en")?.[1] ?? new Map();

  const result = {} as Record<Locale, ConceptCard[]>;

  for (const [code, localeMap] of allCards) {
    if (code === DEFAULT_LOCALE) {
      result[code] = Array.from(enMap.values());
    } else {
      // Clone English map, overlay locale translations
      const merged = new Map(enMap);
      for (const [id, card] of localeMap) {
        merged.set(id, card);
      }
      result[code] = Array.from(merged.values());
    }
  }

  return result;
}
