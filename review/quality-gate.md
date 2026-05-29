# Quality Gate for AI-Written Code

Use this as a final review pass for non-trivial AI-written changes. For typo fixes and small one-line changes, use judgment.

The goal is code that a human reviewer and a future AI agent can understand quickly:

- strict types at API, form, route, storage, and generated-code boundaries
- thin screens and routes, with behavior moved into named hooks, helpers, or focused components
- local ownership: feature code stays near the workflow it serves
- focused tests for behavior, mappings, permissions, transforms, and edge states
- no broad rewrites, premature shared abstractions, or mechanical file splitting

Small local duplication is acceptable when it keeps the workflow clear. Shared abstractions are justified only when they remove real repeated complexity.

---

## Local Consistency Rule

Follow the dominant local project pattern unless it violates a hard gate.

Use this precedence when coding or reviewing:

1. Hard gates in this document: type safety, runtime safety, generated-code boundaries, i18n, testability, backend-state handling, and clear maintainability.
2. App/package-specific conventions and nearby code that already handles the same workflow well.
3. Shared project standards.
4. Examples from other apps or projects as quality references, not mandatory style transplants.

Treat these as preferences unless they create a hard-gate issue:

- translation access style when the surrounding file already uses a different local pattern
- folder layout and component naming that is consistent in the app
- small local duplication that keeps a workflow easier to read
- wrapper/component choices where the app has its own established wrapper
- equivalent helper shapes that are typed, tested, and locally understandable

A local pattern becomes a review issue when it creates unsafe types, repeated complex workflow logic, weak backend-state handling, missing behavioral tests, or forces readers to open many unrelated files to understand one change.

---

## Non-Negotiable Gates

### Type Safety

- Do not add `any`, `unknown as`, non-null assertions, or `as SomeType` casts. The default exception is `as const`.
- If a type escape is unavoidable, isolate it at the boundary and explain why the safer option does not work.
- Use generated API types, local unions/enums, `Record<...>`, and `satisfies` so invalid domain values fail where maps are declared.
- Validate external or unknown data with Zod, the platform parser, or an existing runtime validator before using it.
- Backend-controlled strings and enum-like values should use generated types, local unions/enums, or typed maps instead of repeated raw strings.

### API And Data Boundaries

- Do not edit generated files. Regenerate them through the project command.
- Do not hand-write API clients when generated endpoints, SDKs, or app wrappers exist.
- Manual API code belongs behind a clear boundary and should explain why generation or the standard client cannot be used yet.
- Query invalidation and refetch logic should stay close to the mutation or event that requires it.
- Mutation and API errors should use the app-level error/snackbar/logger pattern, not a raw lower-level dependency.
- Render optional, empty, or impossible-looking backend states safely with an empty state, explicit `null`, or a typed helper that documents the invariant.

### React Shape

- Pages, screens, and routes should be thin. Move non-trivial workflow logic into named hooks, helpers, or focused child components.
- Treat files around 200 lines as a review signal. Split when the file mixes responsibilities or is hard to scan.
- Do not introduce 300+ line components, large render functions, or long inline ternary trees.
- Extract multi-part conditions into named booleans before JSX or branching.
- Extract repeated JSX combinations into local components before creating shared abstractions.
- Keep `useEffect` bodies small. Move async work and event handlers into named functions.
- Do not introduce global client state unless it is already the project's established pattern.

### UI And I18n

- Use app wrappers and the project UI library before lower-level primitives when wrappers exist.
- New user-facing strings go through the app's i18n system when the project has one.
- Do not render empty strings just to satisfy required props. Make the prop optional or create the right component.
- New interactive UI should use stable test IDs when the project has a test ID convention.
- Prefer accessible labels and semantic controls over fragile selector-only behavior.

### Tests

- New domain helpers, maps, permissions, form transforms, query/event refetch decisions, and mutation behavior need focused tests.
- Bug fixes should get a regression test that fails before the fix when practical.
- Avoid placeholder tests that only assert a component renders.
- Prefer small table-driven tests for mappings, state transitions, and validation cases.
- When a test is not practical in the current change, call out the residual risk and keep the code split so it can be tested later.

---

## Review Severity

Request changes for:

- new unsafe type escapes
- generated-code edits or manual API code without a boundary reason
- hardcoded user-facing text in an i18n project
- unsafe rendering of optional or empty backend data
- large new/touched files that mix page, form, mutation, event handling, and rendering concerns
- missing focused tests for new behavior that can regress silently

Leave as a note or follow-up for:

- older untouched code that violates the standard but is outside the task
- small local duplication that keeps the current workflow easier to read
- cosmetic naming improvements that do not affect comprehension or safety
- test gaps that cannot be closed in the current environment but are clearly reported

Do not flag:

- code that follows the dominant local style and does not violate a hard gate
- preference-only rewrites from one app style to another app style
- broad cleanup outside the touched workflow

---

## Before Coding Or Reviewing

Search first instead of inventing:

- project UI primitives and app wrappers
- existing components, hooks, helpers, and domain utilities
- existing test ID conventions
- feature toggle or rollout conventions
- generated API clients, SDKs, types, and enums
- nearby examples for the same workflow shape

---

## Final Self-Review

Before handing back code, check:

- Did I avoid new unsafe type escapes?
- Did I reuse existing components, hooks, helpers, and generated clients where available?
- Are new strings translated and new controls covered by stable test IDs when the project expects them?
- Is the touched code locally readable without opening many unrelated files?
- Did I avoid creating a broad abstraction for one workflow?
- Are optional backend states safe?
- Are behavior-bearing helpers, maps, permissions, transforms, effects, and mutations tested?
- Did the relevant checks run, or is there a concrete environment blocker?

Mention only failed checks, skipped checks, or verification blockers in the final response.
