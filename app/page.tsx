import { loadAllConceptCards } from "@/lib/concept-loader";
import PlaygroundShell from "@/components/PlaygroundShell";

/**
 * Server component that pre-loads MDX concept cards at request time,
 * then passes them to the client-side PlaygroundShell orchestrator.
 *
 * This boundary exists because `compileMDX` (next-mdx-remote/rsc) and
 * `node:fs/promises` are server-only APIs.
 */
export default async function Home() {
  const cardsMap = await loadAllConceptCards();
  const conceptCards = Array.from(cardsMap.values());

  return <PlaygroundShell conceptCards={conceptCards} />;
}
