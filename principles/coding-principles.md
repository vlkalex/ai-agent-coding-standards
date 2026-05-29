# Coding Principles for AI Agents

Four principles that apply to every coding task. For trivial changes (typo fixes, one-liners), use judgment — not every change needs full rigor.

These are designed to be copied directly into your CLAUDE.md or AGENTS.md.

---

## 1. Think Before Coding

Don't assume. Don't hide confusion. Surface tradeoffs.

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

The test: would a senior engineer say this is overcomplicated? If yes, simplify.

## 3. Surgical Changes

Touch only what you must. Clean up only your own mess.

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: every changed line should trace directly to the task.

## 4. Goal-Driven Execution

Define success criteria. Loop until verified.

Transform tasks into verifiable goals:
- "Add validation" becomes "write tests for invalid inputs, then make them pass"
- "Fix the bug" becomes "write a test that reproduces it, then make it pass"
- "Refactor X" becomes "ensure tests pass before and after"

For multi-step tasks, state a brief plan:
1. [Step] then verify: [check]
2. [Step] then verify: [check]
3. [Step] then verify: [check]

---

## Bonus: The Reuse Checklist

Before writing any new code, check:

1. Does the project's UI library have this component?
2. Does a component in `components/` already do this?
3. Does a hook in `hooks/` already handle this logic?
4. Does a helper in `helpers/` or `lib/utils/` already do this calculation?
5. Only if all four are "no" — create something new.

This single checklist prevents the #1 problem with AI-generated code: duplicate implementations of things that already exist in the codebase.
