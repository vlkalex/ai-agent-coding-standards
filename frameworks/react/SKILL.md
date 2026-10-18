---
name: react-standards
description: React layer of the coding standards. Use when writing, refactoring, or reviewing code that imports React (react, react-dom, react-native) — including Next.js, Remix, and Expo projects — for its components, hooks, effects, and JSX.
---

# React Standards

This layer adds React-specific guidance on top of the core standards. It never replaces them: the core quality gate and casebook still apply to every line.

## Sources

Read in this order:

1. The repository's own instructions — they win where they differ.
2. The core standards: `docs/QUALITY-GATE.md` and `docs/REVIEW-CASEBOOK.md`.
3. This layer:
   - [component-guidelines.md](./component-guidelines.md) — when authoring or restructuring components and hooks: reuse decisions, cohesion, boundaries, render and state ownership, memoization, testing.
   - [casebook.md](./casebook.md) — when reviewing, or before writing effects, forms, variant rendering, or hooks: React cases with tiers and a do-not-flag list.

## Server components

In Next.js and other server-component frameworks, guidance about hooks, effects, subscriptions, and memoization applies to client components only. The casebook's header lists which cases apply to both.

## Done when

Authoring: each new component, hook, and effect matches the guidelines, or the departure is stated in the handoff. Reviewing: the diff's React code has been checked against every casebook case, with findings reported in the core casebook's tier format.
