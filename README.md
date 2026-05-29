# AI Agent Coding Standards

Practical guidelines for getting AI coding agents (Claude Code, Codex, Cursor, etc.) to produce consistent, production-quality TypeScript and React/React Native code.

Battle-tested across 5+ production codebases, including a mobile app with 3,500+ users and a regulated banking platform.

## Install

```bash
npx ai-agent-standards init
```

This copies the standard files into your project's `docs/` folder. Then reference them from your `CLAUDE.md` or `AGENTS.md`:

```markdown
## Coding Standards
Before implementing any feature, read:
- docs/COMPONENT-GUIDELINES.md
- docs/CODING-PRINCIPLES.md
```

Use `--force` to overwrite existing files.

## What's inside

| File | What it does |
|------|-------------|
| [component-guidelines.md](./react/component-guidelines.md) | React/React Native component architecture, reuse patterns, testing rules |
| [coding-principles.md](./principles/coding-principles.md) | Universal coding principles for AI agents |
| [claude-md-guide.md](./agents/claude-md-guide.md) | How to write effective CLAUDE.md files that steer agents without micromanaging |
| [agents-md-guide.md](./agents/agents-md-guide.md) | How to write effective AGENTS.md files |
| [ticket-structure.md](./workflow/ticket-structure.md) | How to structure tickets so agents can execute without ambiguity |

## Philosophy

Most developers over-engineer their agent instructions. Long lists of file paths, strict technical mandates, and rigid rules that the agent follows blindly even when the codebase tells a different story.

These standards take a different approach:

**Steer, don't micromanage.** Tell the agent how you think, not which file to edit. A good CLAUDE.md reads like a letter explaining the project philosophy and glossary of terms, not a list of forbidden patterns.

**Principles over rules.** "Simplicity first" is more useful than "never use more than 3 props." Agents are smart enough to apply principles. They're also smart enough to follow bad rules literally.

**Let the agent explore.** It knows the codebase better than your instructions file. Don't specify file paths. Don't tell it which component to modify. Describe what you want and let it figure out where to make the change.

**Reuse before create.** The #1 problem with AI-generated code is duplicate components. These standards explicitly instruct agents to search for existing components, hooks, and helpers before creating new ones.

**Test what matters.** Not everything needs a test. But helpers and pure logic always do. Bug fixes always get a regression test first. Simple presentational components don't need tests.

## See it in action

[alexvlk.com](https://alexvlk.com) was built entirely by AI agents following these standards. The [source code](https://github.com/vlkalex/alexvlk-portfolio) demonstrates what the output looks like: thin page composers, reusable UI primitives, separated data from components, proper types, and no file over 50 lines.

## Who is this for

- Developers using AI coding agents (Claude Code, Codex, Cursor, Windsurf, etc.)
- Teams adopting agentic development workflows
- Solo developers managing multiple codebases with AI assistance
- Anyone tired of AI agents creating 300-line god components with duplicated logic

## Contributing

These are opinionated standards based on real production experience. If you have improvements or alternative approaches that have worked at scale, PRs are welcome.

## License

MIT
