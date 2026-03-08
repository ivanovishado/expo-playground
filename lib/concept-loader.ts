import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ConceptCard, ConceptCategory } from "@/lib/types";

interface ConceptFrontmatter {
  id: string;
  title: string;
  category: ConceptCategory;
  order: number;
  expoDocUrl: string;
}

const CONCEPTS_DIR = join(process.cwd(), "content", "concepts");

export async function loadConceptCard(id: string): Promise<ConceptCard | null> {
  try {
    const filePath = join(CONCEPTS_DIR, `${id}.mdx`);
    const source = await readFile(filePath, "utf-8");

    const { content, frontmatter } = await compileMDX<ConceptFrontmatter>({
      source,
      options: { parseFrontmatter: true },
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

export async function loadAllConceptCards(): Promise<Map<string, ConceptCard>> {
  const cards = new Map<string, ConceptCard>();

  const files = await readdir(CONCEPTS_DIR);
  const mdxFiles = files.filter((f) => f.endsWith(".mdx"));

  const results = await Promise.all(
    mdxFiles.map((file) => {
      const id = file.replace(/\.mdx$/, "");
      return loadConceptCard(id);
    })
  );

  for (const card of results) {
    if (card) {
      cards.set(card.id, card);
    }
  }

  return cards;
}
