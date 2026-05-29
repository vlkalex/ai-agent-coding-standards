# How to Write Effective CLAUDE.md Files

CLAUDE.md is Claude Code's project-level instruction file. It's read at the start of every session and shapes how Claude approaches your codebase. Similar in purpose to AGENTS.md but specifically for Claude Code's conventions.

## CLAUDE.md vs AGENTS.md

If you use Claude Code exclusively, use CLAUDE.md. If you use multiple tools (Claude Code, Codex, Cursor), use AGENTS.md as the universal file and keep CLAUDE.md for Claude-specific settings.

Don't maintain both with overlapping content — pick one as the source of truth for coding guidelines and reference it from the other.

## What goes in CLAUDE.md

### Project context (always include)

```markdown
# Project Name

Brief description of the project. What it does, who uses it.

## Tech stack
- Frontend: React Native (Expo)
- Backend: NestJS + GraphQL
- Database: PostgreSQL with Prisma
- Hosting: AWS
```

### Build and test commands (always include)

```markdown
## Development

npm run dev          # Start dev server
npm run build        # Build for production
npm test             # Run tests
npm run lint         # Lint check
```

Claude Code uses these to verify its own work. If it doesn't know how to run tests, it can't verify changes.

### Coding standards (reference, don't duplicate)

```markdown
## Coding Standards

Before implementing any feature, read:
- docs/COMPONENT-GUIDELINES.md — component architecture rules
- docs/CODING_STANDARDS.md — general TypeScript standards

Check existing components, hooks, and helpers before creating new ones.
```

### Project-specific rules

```markdown
## Rules

- Use the existing HeroUI component library for all UI primitives
- All prices are stored in EUR cents (integers), displayed with 2 decimal places
- GraphQL schema changes require running: npm run codegen
- Never modify generated/graphql.ts directly — it's auto-generated
```

### What NOT to do

```markdown
## Do not

- Don't install new dependencies without asking
- Don't modify the auth flow (lib/auth-client.ts)
- Don't create migration files — ask first
- Don't use console.log — use the logger utility
```

## Anti-patterns to avoid

**Don't paste your entire architecture doc.** Claude reads the code. It doesn't need a 500-line description of how your app works. It needs to know what patterns to follow and what to avoid.

**Don't list every file path.** Paths change. Instead of "the auth module is at src/lib/auth/index.ts", write "the auth module is in lib/auth/ — don't modify it."

**Don't write rules the linter enforces.** Claude sees linter errors. Writing "use single quotes" when your ESLint config already enforces it is wasted tokens.

**Don't write aspirational rules you don't follow.** If your codebase has zero tests, don't write "every function must have a test." Write what's actually true: "add tests for helpers and pure logic. Screen components don't need tests."

## Tips

**Put CLAUDE.md at the project root.** Claude Code looks for it there first.

**Keep it under 150 lines.** The file is re-read every session. Long files cost tokens and dilute the important instructions.

**Use nested CLAUDE.md for monorepos.** Put a root-level CLAUDE.md with shared rules, and per-package CLAUDE.md files with package-specific rules:

```
/CLAUDE.md              # Shared: repo structure, monorepo commands
/apps/api/CLAUDE.md     # API-specific: NestJS patterns, DB rules
/apps/mobile/CLAUDE.md  # Mobile-specific: RN patterns, navigation
/packages/core/CLAUDE.md # Core-specific: service patterns
```

**Update it reactively.** Don't try to anticipate every rule upfront. When the agent makes a mistake, add a one-line rule to prevent it next time. The file grows from real problems, not imagined ones.
