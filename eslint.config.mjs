import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import nextConfig from "eslint-config-next";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

const gitignorePath = resolve(import.meta.dirname, ".gitignore");
const gitignorePatterns = readFileSync(gitignorePath, "utf8")
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"));

const eslintConfig = [
  {
    ignores: [
      ...gitignorePatterns,
      "content/concepts/**",
      ".agents/**",
      ".claude/**",
      ".agent/**",
      "docs/**",
    ],
  },
  ...nextConfig,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": tseslint,
    },
    languageOptions: {
      parser: tsparser,
    },
    rules: {
      "no-console": "error",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
];

export default eslintConfig;
