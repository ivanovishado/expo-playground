import { SUPPORTED_LOCALES } from "@/lib/types";

/**
 * Centralized SEO constants.
 * When a custom domain is configured, update SITE_URL here
 * and remove basePath from next.config.ts.
 */
export const SITE_URL = "https://www.ivanovishado.dev/expo-playground";
export const SITE_NAME = "Annotated Expo Playground";
export const SITE_DESCRIPTION =
  "An educational tool that helps students understand Expo/React Native code through AST-detected concept highlights and guided walkthroughs.";

export function contentUrl(locale: string, path = ""): string {
  return `${SITE_URL}/${locale}${path}`;
}

export function hreflangAlternates(path: string): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const { code } of SUPPORTED_LOCALES) {
    alternates[code] = contentUrl(code, path);
  }
  return alternates;
}
