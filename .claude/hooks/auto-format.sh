#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ] || [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

# Use RTK when available for token-optimized output
if command -v rtk &>/dev/null; then
  PRETTIER="rtk prettier"
else
  PRETTIER="npx prettier"
fi

case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.mdx)
    $PRETTIER --write "$FILE_PATH" 2>/dev/null ;;
esac

exit 0
