# AI Agent Coding Standards

Standards for getting AI agents to write clean React, React Native, and TypeScript code. Stop agents from creating 300-line god components with duplicated logic.

Developed while building a mobile app with 3,500+ users, a SaaS platform, and several TypeScript projects. They solve the real problems I kept hitting: duplicate components, inconsistent patterns, and agents that ignore existing code.

## Install

```bash
npx ai-agent-standards init
```

Copies the standard files into your project's `docs/` folder. Then reference them from your `CLAUDE.md` or `AGENTS.md`:

```markdown
## Coding Standards
Before implementing any feature, read:
- docs/COMPONENT-GUIDELINES.md
- docs/CODING-PRINCIPLES.md
```

Use `--force` to overwrite existing files.

## What's inside

| File | What it covers |
|------|---------------|
| [component-guidelines.md](./react/component-guidelines.md) | React/React Native component architecture, reuse patterns, testing rules |
| [coding-principles.md](./principles/coding-principles.md) | Four universal principles: think first, simplicity, surgical changes, goal-driven execution |
| [claude-md-guide.md](./agents/claude-md-guide.md) | How to write CLAUDE.md files that steer agents without micromanaging |
| [agents-md-guide.md](./agents/agents-md-guide.md) | How to write AGENTS.md files for any AI coding tool |
| [ticket-structure.md](./workflow/ticket-structure.md) | How to structure tickets so agents can execute without ambiguity |

## Philosophy

Most developers over-engineer their agent instructions. Long lists of file paths, strict technical mandates, and rigid rules that the agent follows blindly even when the codebase tells a different story.

These standards take a different approach:

**Steer, don't micromanage.** Tell the agent how you think, not which file to edit. A good CLAUDE.md reads like a letter explaining the project philosophy, not a list of forbidden patterns.

**Reuse before create.** The #1 problem with AI-generated React code is duplicate components. Every standard here starts with "check what already exists" before writing anything new.

**Principles over rules.** "Simplicity first" is more useful than "never use more than 3 props." Agents are smart enough to apply principles. They're also smart enough to follow bad rules literally.

**Let the agent explore.** It knows the codebase better than your instructions file. Don't specify file paths. Describe what you want and let it figure out where to make the change.

**Test what matters.** Not everything needs a test. But helpers and pure logic always do. Bug fixes always get a regression test first. Simple presentational components don't need tests.

## See it in action

[alexvlk.com](https://alexvlk.com) was built entirely by AI agents following these standards. The [source code](https://github.com/vlkalex/alexvlk-portfolio) shows what the output looks like: thin page composers, reusable UI primitives, separated data, proper types, no file over 50 lines.

## Who is this for

- Developers using AI agents to write React, React Native, or TypeScript
- Solo developers tired of agents creating duplicate components across their codebase
- Teams adopting agentic development and wanting a shared set of standards
- Anyone using Claude Code, Codex, Cursor, or similar tools for frontend work

## Contributing

These are opinionated standards based on real project experience. If you have improvements that have worked for you, PRs are welcome.

## License

MIT
