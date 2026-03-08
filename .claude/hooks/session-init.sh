#!/bin/bash
INPUT=$(cat)
SOURCE=$(echo "$INPUT" | jq -r '.source // "startup"')

if [ "$SOURCE" = "compact" ]; then
  cat << 'EOF'
CRITICAL REMINDERS (post-compaction):
- Check AGENTS.md Section 7 and load ALL relevant skills before starting tasks.
- TypeScript strict: no `any`. No console.log in app code.
- Use Context7 for CodeMirror 6, Babel, and snack-sdk APIs before implementing.
- Quality gates: type-check must pass before completing work.
EOF
  exit 0
fi

cat << 'EOF'
MANDATORY SESSION INITIALIZATION:
1. Read AGENTS.md completely before starting any work.
2. Check AGENTS.md Section 7 (Skill Intent Table) and load ALL relevant skills with the Skill tool BEFORE starting ANY task.
3. Use Context7 for CodeMirror 6, Babel traverse, and snack-sdk APIs — these are specialized and need precise docs.
4. Quality gates: Type-check must pass before completing any task (enforced by Stop hook).
5. Code conventions: strict TypeScript (no `any`), no console.log in app code, Tailwind v4 CSS-first config.
EOF
exit 0
