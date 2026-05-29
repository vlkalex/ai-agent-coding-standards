# How to Write Effective AGENTS.md Files

Your AGENTS.md is the single most important file for shaping how AI agents behave in your project. A good one makes agents feel like they understand your codebase. A bad one either gets ignored or actively misleads.

## What AGENTS.md is for

AGENTS.md tells the agent how you think about the project, not how to edit files. It should answer:

- What is this project and what does it do?
- How do we think about building it?
- What patterns do we follow and why?
- What should the agent never do?

## What NOT to put in AGENTS.md

- File paths that will go stale ("edit src/components/Button.tsx")
- Implementation details that belong in code comments
- Copy of your tech stack (the agent can read package.json)
- Rules so specific that they break when the codebase evolves
- 5,000 lines of everything you've ever thought about code

## Structure that works

```markdown
# Project Name

One paragraph: what this project is, who it's for, what it does.

## How we build

2-3 paragraphs written like a letter to a new developer joining
the team. Explain the philosophy, not the details. The agent
will figure out the details from the code.

## Glossary

Define ambiguous terms. Especially important when the same word
could mean different things:
- "user" = end user of the app
- "developer" = someone building on our platform
- "agent" = the AI that's editing code right now

## Principles

3-5 principles you actually care about. Not aspirational rules
you don't follow — real things that guide decisions.

## Do not

Short list of things that have gone wrong before.
- Don't add new dependencies without asking
- Don't modify the auth layer
- Don't create new API routes without a corresponding test
```

## Tips from production experience

**Write it by hand.** Don't let an agent generate your AGENTS.md. It needs to reflect how you actually think, not how an AI thinks you think.

**Keep it under 200 lines.** If it's longer, the agent spends too many tokens reading instructions instead of reading your code. Short and opinionated beats long and comprehensive.

**Update it when the agent keeps making the same mistake.** If you find yourself correcting the agent on the same thing in multiple threads, add one line to AGENTS.md. That's how the file grows organically.

**Use a glossary for domain-heavy projects.** Finance, healthcare, logistics — any domain where words have specific meanings that differ from common usage. The glossary prevents the agent from making wrong assumptions.

**Don't duplicate your linter.** If ESLint already enforces semicolons, don't also write "always use semicolons" in AGENTS.md. The agent will see the linter errors.

## Example: minimal but effective

```markdown
# Acme Dashboard

Internal dashboard for the ops team to monitor order processing.
React + TypeScript frontend, NestJS API, PostgreSQL.

## How we build

We optimize for clarity over cleverness. The ops team reads this
code when debugging production issues, so every component should
be obvious in what it does. No abstractions for single-use code.

We use the existing component library (Shadcn) for all UI. Don't
create custom components when Shadcn has one that works.

## Glossary

- "order" = a customer purchase order (not a sort order)
- "processing" = the backend pipeline that fulfills orders
- "operator" = an ops team member using this dashboard

## Principles

1. Thin screens, fat hooks. Screens compose, hooks contain logic.
2. Every API call goes through a React Query hook. No raw fetch.
3. New features get a helper test. New screens don't need tests.

## Do not

- Don't add new npm packages without checking if an existing one covers it
- Don't modify anything in lib/auth/ — it's shared with the mobile app
- Don't use any or type assertions unless there's a comment explaining why
```

This is 30 lines and gives the agent everything it needs. The agent will read the code for everything else.
