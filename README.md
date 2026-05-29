# AI Agent Coding Standards

Practical guidelines for getting AI coding agents (Claude Code, Codex, Cursor, etc.) to produce consistent, production-quality TypeScript and React/React Native code.

These standards are battle-tested across 5+ production codebases, including a mobile app with 3,500+ users and a regulated banking platform. They're designed to be dropped into your `CLAUDE.md`, `AGENTS.md`, or any agent instruction file.

## What's inside

| File | Purpose |
|------|---------|
| [component-guidelines.md](./react/component-guidelines.md) | React/React Native component architecture |
| [agents-md-guide.md](./agents/agents-md-guide.md) | How to write effective AGENTS.md files |
| [claude-md-guide.md](./agents/claude-md-guide.md) | How to write effective CLAUDE.md files |
| [coding-principles.md](./principles/coding-principles.md) | Universal coding principles for AI agents |
| [ticket-structure.md](./workflow/ticket-structure.md) | How to structure tickets for agent execution |

## Philosophy

Most developers over-engineer their agent instructions. Long lists of file paths, strict technical mandates, and rigid rules that the agent follows blindly even when the codebase tells a different story.

These standards take a different approach:

1. **Steer, don't micromanage.** Tell the agent how you think, not which file to edit.
2. **Principles over rules.** "Simplicity first" beats "never use more than 3 props."
3. **Let the agent explore.** It knows the codebase better than your instructions file.
4. **Test what matters.** Not everything needs a test. But helpers and pure logic always do.
5. **Reuse before create.** The #1 problem with AI-generated code is duplicate components.

## Quick start

Copy the files you need into your project's `docs/` folder, then reference them from your `CLAUDE.md` or `AGENTS.md`:

```markdown
## Coding Standards
Before implementing any feature, read:
- docs/component-guidelines.md
- docs/coding-principles.md
```

## Who is this for

- Developers using AI coding agents (Claude Code, Codex, Cursor, Windsurf, etc.)
- Teams adopting agentic development workflows
- Solo developers managing multiple codebases with AI assistance

## Contributing

These are opinionated standards based on real production experience. If you have improvements or alternative approaches that have worked at scale, PRs are welcome.

## License

MIT
