# AI Agent Coding Standards

Standards for getting AI agents to write cohesive, reuse-aware TypeScript code without mechanical layering or speculative abstractions. A framework-neutral core, plus framework layers that load only for that framework's code — React (including Next.js and React Native) today.

## Install

```bash
npx ai-agent-standards init
```

Copies the core standards into your project's `docs/` folder and installs two core skills — `reuse-first-authoring` and `agent-code-review` — for Agent Skills-compatible tools under `.agents/skills/` and for Claude Code under `.claude/skills/`.

If your `package.json` depends on React (`react`, `react-native`, `next`, `expo`, …), it also installs the `react-standards` layer skill. Detection reads only `./package.json`: in a monorepo, run it at the repository root with `--framework react`, so the docs and skills land where your agent looks for them. Use `--framework none` for the core only. Re-running never removes files, so delete a layer's skill folders yourself to drop it.

Upgrading from 1.x (2.0 breaking change): `docs/COMPONENT-GUIDELINES.md` is no longer installed; it moved into the React layer. Delete the old copy and point any `CLAUDE.md`/`AGENTS.md` reference at the `react-standards` skill.

Add a short trigger using the invocation syntax your agent supports:

```markdown
## Reuse-first authoring

Before non-trivial implementation or refactoring, invoke the reuse-first authoring skill.
- Codex: `$reuse-first-authoring`
- Claude Code: `/reuse-first-authoring`
- If project skills are not discovered automatically, read
  `.agents/skills/reuse-first-authoring/SKILL.md` directly.

## Code review

Before requesting human review, invoke the agent code review skill.
- Codex: `$agent-code-review`
- Claude Code: `/agent-code-review`
```

Use `--force` to overwrite existing files.

## ESLint plugin

The standards that reviewers flag most are mechanical, so they ship as lint rules too: [`eslint-plugin/`](./eslint-plugin/README.md) — 16 rules (named conditions, named hook deps, one component per file, no double assertions, no verbose comments, no inline noops, `.ts` without JSX, boolean-function naming, TODOs with tickets, no JSX variant maps built in render, …) plus two CI checkers for translation parity and snapshot coverage. Each rule maps to a real review comment; defaults were calibrated on a 10k-file React Native codebase.

```bash
npm i -D eslint-plugin-ai-agent-standards
```

```js
// eslint.config.js
const aiAgentStandards = require('eslint-plugin-ai-agent-standards');
module.exports = [aiAgentStandards.configs.react]; // React, Next.js, React Native
// any other TypeScript project: aiAgentStandards.configs.typescript
```

## What's inside

| File | What it covers |
|------|---------------|
| [coding-principles.md](./principles/coding-principles.md) | Four universal principles: think first, simplicity, surgical changes, goal-driven execution |
| [quality-gate.md](./review/quality-gate.md) | Final review pass for type safety, API boundaries, i18n, tests, and local consistency |
| [review-casebook.md](./review/review-casebook.md) | Before/after cases of what strict human reviewers flag on agent-written code, tiered, with a do-not-flag list |
| [mining-review-feedback.md](./workflow/mining-review-feedback.md) | How to turn your own reviewers' comments into tiered rules, a casebook, decision docs, and lint rules |
| [claude-md-guide.md](./agents/claude-md-guide.md) | How to write CLAUDE.md files that steer agents without micromanaging |
| [agents-md-guide.md](./agents/agents-md-guide.md) | How to use a short AGENTS.md as a trigger for focused guidance |
| [ticket-structure.md](./workflow/ticket-structure.md) | How to structure tickets so agents can execute without ambiguity |
| [project-skill-template.md](./workflow/project-skill-template.md) | How to create focused repo/app/workflow skills with progressive disclosure |
| [reuse-first-authoring](./skills/reuse-first-authoring/SKILL.md) | Focused discovery, ownership-decision, implementation, and verification workflow |
| [agent-code-review](./skills/agent-code-review/SKILL.md) | Dimensioned review passes plus a holistic pass, an evidence contract, and tiered findings |
| [frameworks/](./frameworks/README.md) | Framework layers, and how to add one |
| [react-standards](./frameworks/react/SKILL.md) | React layer: [component guidelines](./frameworks/react/component-guidelines.md) and a [React casebook](./frameworks/react/casebook.md) for effects, rendering, subscriptions, and hooks |

## Where these apply

The standards come in [layers](./frameworks/README.md):

| Layer | Content | Loaded |
|---|---|---|
| Core | Coding principles, quality gate, core casebook, reuse-first and review skills, mining workflow, the plugin's `typescript` lint preset | Always. Holds for any TypeScript: Angular, Vue, Svelte, Node services, CLIs, and React |
| React | Component guidelines, React casebook, the JSX and hook lint rules | Only when the code uses React: web apps, Next.js, Remix, React Native, Expo |

An agent working in Angular gets the core and never sees the React casebook. Cases that matter in every framework — naming, exhaustive state maps, backend contracts, error flows, layout before data, static routes — are in the core, written without framework syntax. Each React case names the core case it extends.

No layer names a library. Form, data-fetching, routing, and validation guidance is written against the role a library plays ("the form handle", "the data layer's polling interval"), so it holds whichever packages a project picked.

In Next.js and other server-component frameworks, the React layer's hook, effect, and memoization cases apply to client components only; its casebook lists which cases apply to both.

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

**Learn from your reviewers.** The best standards are mined, not invented: recurring review comments, tiered by how reviewers actually treat them, with worked examples and a list of what they accept. Record the accepted patterns too; without them, agent reviewers invent findings no human would raise.

**Review in passes.** A single holistic review skims. Rule-by-rule passes catch the reuse and typing misses; a holistic pass catches the behavioral bugs. Every finding quotes a line and carries a severity tier.

**Gate hard risks, not preferences.** A good review gate blocks unsafe types, generated-code edits, hardcoded i18n strings, unsafe backend states, and missing behavior tests. It does not force one app's harmless local style onto another.

**Use progressive disclosure for big repos.** Put app conventions, generated API workflows, review gates, and repeated task playbooks in focused skills. Keep detailed references on demand so unrelated tasks do not load them.

## See it in action

[alexvlk.com](https://alexvlk.com) is a simple portfolio site, but it was built entirely by AI agents following these standards. The [source code](https://github.com/vlkalex/alexvlk-portfolio) demonstrates reusable UI contracts, cohesive ownership, separated data boundaries, and strict types in a small project.

## Who is this for

- Developers using AI agents to write React, React Native, or TypeScript
- Solo developers tired of agents creating duplicate components across their codebase
- Teams adopting agentic development and wanting a shared set of standards
- Anyone using Claude Code, Codex, Cursor, or similar tools on TypeScript code

## Contributing

These are opinionated standards based on real project experience. If you have improvements that have worked for you, PRs are welcome.

## License

MIT
