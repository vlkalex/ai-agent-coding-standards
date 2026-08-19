# AI Agent Coding Standards

Standards for getting AI agents to write cohesive, reuse-aware React, React Native, and TypeScript code without mechanical layering or speculative abstractions.

## Install

```bash
npx ai-agent-standards init
```

Copies the reference standards into your project's `docs/` folder and installs the focused workflow for Agent Skills-compatible tools at `.agents/skills/reuse-first-authoring/` and for Claude Code at `.claude/skills/reuse-first-authoring/`.

Add a short trigger using the invocation syntax your agent supports:

```markdown
## Reuse-first authoring

Before non-trivial implementation or refactoring, invoke the reuse-first authoring skill.
- Codex: `$reuse-first-authoring`
- Claude Code: `/reuse-first-authoring`
- If project skills are not discovered automatically, read
  `.agents/skills/reuse-first-authoring/SKILL.md` directly.
```

Use `--force` to overwrite existing files.

## What's inside

| File | What it covers |
|------|---------------|
| [component-guidelines.md](./react/component-guidelines.md) | Evidence-based UI reuse, cohesion, extraction, memoization, and testing |
| [coding-principles.md](./principles/coding-principles.md) | Four universal principles: think first, simplicity, surgical changes, goal-driven execution |
| [quality-gate.md](./review/quality-gate.md) | Final review pass for type safety, API boundaries, i18n, tests, and local consistency |
| [claude-md-guide.md](./agents/claude-md-guide.md) | How to write CLAUDE.md files that steer agents without micromanaging |
| [agents-md-guide.md](./agents/agents-md-guide.md) | How to use a short AGENTS.md as a trigger for focused guidance |
| [ticket-structure.md](./workflow/ticket-structure.md) | How to structure tickets so agents can execute without ambiguity |
| [project-skill-template.md](./workflow/project-skill-template.md) | How to create focused repo/app/workflow skills with progressive disclosure |
| [reuse-first-authoring](./skills/reuse-first-authoring/SKILL.md) | Focused discovery, ownership-decision, implementation, and verification workflow |

## Philosophy

Most developers over-engineer their agent instructions. Long lists of file paths, strict technical mandates, and rigid rules that the agent follows blindly even when the codebase tells a different story.

These standards take a different approach:

**Steer, don't micromanage.** Tell the agent how you think, not which file to edit. A good CLAUDE.md reads like a letter explaining the project philosophy, not a list of forbidden patterns.

**Reuse with evidence.** Before creating UI, identify its responsibility, search project-owned candidates, inspect a representative usage, and choose `reuse`, `extend`, `feature-local`, or `shared`. Project canonical semantic components come before vendor primitives.

**Enforce stable contracts, review domain choices.** Bypassing an explicitly established canonical primitive needs a concrete semantic or behavioral gap. Domain components are contextual candidates; similar markup alone should not force reuse.

**Cohesion over slogans.** Screens do not have to be empty composers, hooks should not become logic warehouses, and line counts are review signals rather than automatic split points. A private single-use extraction can improve clarity without becoming a shared abstraction.

**Optimize only for a reason.** Memoization is appropriate for a specific computation cost or identity contract, not as a blanket convention.

**Route, do not inventory.** Keep `AGENTS.md` short. Use it to trigger focused standards and skills, then let the agent inspect current code, configuration, representative usages, and schemas as the source of truth.

**Test what matters.** Focus on behavior that can regress silently: domain rules, validation, permissions, state transitions, effects, and mutation flows. Bug fixes get a regression case when practical; tests that only mirror simple rendering add little value.

**Gate hard risks, not preferences.** A good review gate blocks unsafe types, generated-code edits, hardcoded i18n strings, unsafe backend states, and missing behavior tests. It does not force one app's harmless local style onto another.

**Use progressive disclosure for big repos.** Put app conventions, generated API workflows, review gates, and repeated task playbooks in focused skills. Keep detailed references on demand so unrelated tasks do not load them.

## See it in action

[alexvlk.com](https://alexvlk.com) is a simple portfolio site, but it was built entirely by AI agents following these standards. The [source code](https://github.com/vlkalex/alexvlk-portfolio) demonstrates reusable UI contracts, cohesive ownership, separated data boundaries, and strict types in a small project.

## Who is this for

- Developers using AI agents to write React, React Native, or TypeScript
- Solo developers tired of agents creating duplicate components across their codebase
- Teams adopting agentic development and wanting a shared set of standards
- Anyone using Claude Code, Codex, Cursor, or similar tools for frontend work

## Contributing

These are opinionated standards based on real project experience. If you have improvements that have worked for you, PRs are welcome.

## License

MIT
