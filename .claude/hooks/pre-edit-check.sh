#!/bin/bash
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# --- Block sensitive/generated files ---
case "$FILE_PATH" in
  *.env|*.env.local|*.env.production|*.env.development)
    echo "BLOCKED: Do not edit .env files. These contain secrets and must be managed manually." >&2
    exit 2 ;;
  */package-lock.json|*/pnpm-lock.yaml|*/yarn.lock)
    echo "BLOCKED: Do not edit lock files. Use npm install/uninstall commands instead." >&2
    exit 2 ;;
  */node_modules/*)
    echo "BLOCKED: Do not edit files in node_modules/." >&2
    exit 2 ;;
esac

# --- Check code patterns in new content ---
if [ "$TOOL_NAME" = "Write" ]; then
  CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // empty')
elif [ "$TOOL_NAME" = "Edit" ]; then
  CONTENT=$(echo "$INPUT" | jq -r '.tool_input.new_text // empty')
else
  exit 0
fi

# Skip pattern checks for non-TS files
case "$FILE_PATH" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac

# Check for console.log in app code (allow in test files)
case "$FILE_PATH" in
  *.test.ts|*.test.tsx|*.spec.ts|*.spec.tsx) ;;
  *)
    if echo "$CONTENT" | grep -qE 'console\.(log|warn|error|info|debug)\s*\('; then
      echo "BLOCKED: console.log detected in app code. Remove it or use a proper logging utility." >&2
      exit 2
    fi ;;
esac

# Check for TypeScript 'any' type
if echo "$CONTENT" | grep -qE ':\s*any\b|<any>|as\s+any\b'; then
  echo "BLOCKED: TypeScript 'any' type detected. This project uses strict TypeScript — use proper types." >&2
  exit 2
fi

exit 0
