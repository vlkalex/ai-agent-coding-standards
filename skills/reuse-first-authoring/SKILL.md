---
name: reuse-first-authoring
description: Discover and reuse existing project capabilities before creating TypeScript components, hooks, helpers, services, or other abstractions, in any framework. Use before non-trivial implementation or refactoring when work may overlap project UI primitives, app wrappers, domain components, hooks, utilities, generated clients, or established workflow patterns, and use again during final review to justify every new abstraction.
---

# Reuse-First Authoring

Optimize for the smallest understandable change surface. Reuse behavior and ownership, not merely similar syntax.

## Discover before writing

1. Identify each responsibility the change needs: visual primitive, interaction, data access, state ownership, validation, formatting, navigation, or domain policy.
2. Read repository instructions and any project capability catalog.
3. Find the nearest compatible implementation and trace its callers: who loads and narrows data, owns state, validates, submits, and handles failure.
4. Inspect candidate contracts and representative usage, including variants, lifecycle, accessibility, and composition.
5. Establish which ownership pattern fits and which requirement demands a departure. Reusing primitives alone does not establish a compatible workflow.

Directory listings and name matches are leads, not completed discovery.

Use this precedence when responsibilities match:

1. An established project semantic component, adapter, generated client, or domain boundary.
2. An existing feature or domain implementation with the same behavior and ownership.
3. An extension to an existing local boundary when the new behavior fits its responsibility.
4. An installed library primitive when no project boundary owns that responsibility.
5. A new feature-local implementation.
6. A new shared abstraction only after real consumers demonstrate a stable shared contract.

Do not bypass a project wrapper to use the lower-level primitive it owns. Do not copy a legacy exception merely because it is nearby.

## Record the reuse decision

Before implementation, briefly identify the exemplar, selected owners, and concrete gaps in the existing plan or reuse map; use a short response if neither exists. This skill adds no separate checklist or receipt.

For each proposed abstraction, compare direct composition and extension of the existing boundary. Extract only when the new boundary improves coherence enough to justify its indirection.

A reuse map is a hypothesis, not approval to create its listed files. If implementation exposes a simpler shape or incompatible contract, revise the decision and record the departure and evidence. Preserve the distinction between the original plan and what changed.

A small visual difference is normally a reason to use a supported variant or extend the canonical component, not create a parallel implementation.

## Choose the code shape

Keep code together when it changes together. A name, file-size target, or ability to unit-test a helper alone does not establish an independent responsibility.

Promote code to shared infrastructure only when consumers share semantics and ownership. Similar markup or hypothetical future reuse is insufficient.

Resolve initial data once at its owning boundary and pass the narrowed result onward. Keep revalidation when time, authority, or inputs can change, such as submission against refreshed data.

Preserve generated types through internal helpers; narrow the actual uncertainty. Validate genuinely untrusted data at its entry boundary using established validators where available. A partial predicate must not claim fields it has not established.

Keep necessary domain mappings, safety checks, and distinct lifetimes. Simplification must preserve behavior; unrelated features need not share a mapper or coordinator.

## Apply enforcement at the right level

Use existing deterministic checks for imports, generated-file ownership, theme tokens, and package boundaries. Keep configured coverage requirements; passing them does not establish a good design.

Use contextual review for domain-level reuse where semantic equivalence cannot be proven statically. Do not force unrelated workflows through one abstraction to satisfy a reuse metric.

## Verify after implementation

Use the required review pass, not an additional review cycle:

1. Trace the changed behavior across callers, hooks, and helpers. Challenge duplicated resolution, validation, state, and failure handling against the exemplar.
2. Reconsider each new abstraction against simpler composition and its actual consumers. Imports and map rows are not proof of reuse.
3. Run targeted repository checks and tests for meaningful behavior and required invariants. For visible UI, use the project's visual or device-verification workflow when available.
4. Report substantive departures and remaining maintenance cost in the existing handoff. This skill adds no audit artifact or per-helper test-file requirement.
