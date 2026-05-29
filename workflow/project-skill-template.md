# Project Skill Template for AI Agents

Use project skills when a repository is too large or too domain-heavy for one short `AGENTS.md`.

`AGENTS.md` should stay small and philosophical. Project skills can hold focused, task-specific operating knowledge that the agent loads only when relevant.

Good use cases:

- large monorepos with multiple apps or packages
- generated API clients or SDK workflows
- domain-specific rules such as permissions, payments, medical records, loans, trading, logistics, or compliance
- repeated workflows such as "add a page", "add a dialog", "add an endpoint", "add a task type"
- strict review gates for risky or AI-generated code

Bad use cases:

- duplicating the linter or formatter
- documenting every file in the repository
- storing stale route trees, package inventories, or implementation trivia
- forcing one app's style onto another app that has a safe local pattern
- replacing code search with instructions

---

## Skill Shape

```markdown
---
name: app-orders
description: |
  App-specific conventions for the orders dashboard.
  Use when:
    - working in apps/orders/
    - user mentions "orders dashboard"
    - file paths contain "apps/orders"
---

# Orders Dashboard Conventions

> This skill supplements the root AGENTS.md and the shared coding standards.

## Overview

- Package: `@acme/orders`
- Purpose: internal operations dashboard for order processing
- Main risks: wrong order state transitions, stale customer data, accidental manual refunds

## Local Patterns

- Use existing app wrappers before shared lower-level UI primitives.
- Keep route files thin. Put workflow behavior in hooks or focused child components.
- New user-facing strings go in all locale files.
- Use generated API types and endpoint hooks from `src/api/generated/`.

## Review Gates

- Do not edit generated API files.
- Do not add new order state strings outside the typed state map.
- New order-state transitions need table-driven tests.
- Empty backend states must render explicit empty UI, not crash or silently disappear.

## Verification

- Type check: `pnpm --filter @acme/orders check:type`
- Tests: `pnpm --filter @acme/orders test`
- Full check: `pnpm --filter @acme/orders check:code`
```

---

## Recommended Skill Types

### Framework Skill

Use for shared conventions across a monorepo.

Include:

- tech stack only when it changes how the agent should code
- shared UI, form, routing, data, i18n, and test patterns
- generated-code boundaries
- common verification commands
- "ask vs proceed" rules

Avoid:

- full architecture history
- complete route trees
- long package inventories
- rules already enforced by lint/type checks

### App Skill

Use for one app or package.

Include:

- purpose and main product risks
- local wrappers and conventions
- auth, permissions, i18n, API, routing, and test patterns that affect implementation
- local verification commands
- examples worth inspecting before similar work

Avoid:

- copying another app's conventions as mandatory rules
- documenting every page
- restating the framework skill

### Tool Or Boundary Skill

Use for generated APIs, database migrations, queues, feature flags, docs generation, or release workflows.

Include:

- source of truth
- read-only/generated paths
- command to regenerate or sync
- import/use conventions
- manual fallback boundary and when it is allowed
- verification commands

### Review Gate Skill

Use for strict final review.

Include:

- hard gates
- local consistency rule
- review severity
- final self-review checklist

Keep it focused on issues worth blocking a change over.

---

## Design Rules

- Keep each skill focused. If a section only applies to one repeated workflow, create a workflow skill instead of bloating the app skill.
- Put trigger conditions in the description so the agent knows when to load the skill.
- Prefer "search these places first" over "edit this file".
- Include commands the agent can run to verify its work.
- Use examples as references, not mandatory transplants.
- Update skills reactively when agents make repeated mistakes.
- Delete stale facts. Wrong instructions are worse than missing instructions.

---

## Root AGENTS.md Reference

In a repo that uses project skills, keep the root file short:

```markdown
## Coding Standards

Before implementing non-trivial changes, read:
- docs/CODING-PRINCIPLES.md
- docs/COMPONENT-GUIDELINES.md
- docs/QUALITY-GATE.md

For app-specific or workflow-specific work, load the relevant project skill before editing.
```
