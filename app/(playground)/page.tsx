import { loadAllConceptCardsByLocale } from "@/lib/concept-loader";
import PlaygroundShell from "@/components/PlaygroundShell";

/**
 * Server component that pre-loads MDX concept cards for all locales
 * at build time, then passes them to the client-side PlaygroundShell.
 *
 * This boundary exists because `compileMDX` (next-mdx-remote/rsc) and
 * `node:fs/promises` are server-only APIs.
 */
export default async function Home() {
  const conceptCardsByLocale = await loadAllConceptCardsByLocale();

  return <PlaygroundShell conceptCardsByLocale={conceptCardsByLocale} />;
}
