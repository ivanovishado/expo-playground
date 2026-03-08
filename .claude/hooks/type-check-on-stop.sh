#!/bin/bash
INPUT=$(cat)

# Prevent infinite loops
STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')
if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  exit 0
fi

# Only type-check if there are modified TS/TSX files
if ! git status --porcelain 2>/dev/null | grep -qE '\.(ts|tsx)$'; then
  exit 0
fi

# Use RTK when available for token-optimized output
if command -v rtk &>/dev/null; then
  TSC="rtk tsc"
else
  TSC="npx tsc"
fi

TSC_OUTPUT=$($TSC --noEmit 2>&1)
TSC_EXIT=$?

if [ $TSC_EXIT -ne 0 ]; then
  echo "TypeScript type-check failed. Fix these errors before completing:" >&2
  echo "$TSC_OUTPUT" | head -40 >&2
  exit 2
fi

exit 0
