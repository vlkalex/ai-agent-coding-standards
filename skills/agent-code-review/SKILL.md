---
name: agent-code-review
description: Review TypeScript changes the way strict human reviewers do, before humans see them. Use for a branch, pull or merge request, uncommitted work, or a pre-review self-check of agent-written code.
---

# Agent Code Review

Review shape as well as behavior. One undirected pass skims: in a measured comparison, rule-by-rule passes caught about ten findings a single holistic reviewer missed — including a hand-rolled copy of an existing component — while the holistic pass alone caught the behavioral bugs (a double-submit race, a missing back guard). Run both kinds.

Green tests, a reuse map, a passed checklist, or a smaller file do not establish a good boundary.

## Sources

Read before the diff, in this order of authority:

1. The repository's own instructions and review rules (`AGENTS.md`, `CLAUDE.md`, contributing guides, project skills).
2. The project's casebook and decision docs if it has them; otherwise `docs/REVIEW-CASEBOOK.md` (installed by `ai-agent-standards init`) for cases, tiers, and the **do-not-flag** list.
3. `docs/QUALITY-GATE.md` for hard gates and severity.
4. The framework layer matching the changed code, if one is installed as a skill (named `<framework>-standards`). Load only the layer for the framework the diff uses.

Where the project's rules and the casebooks disagree, the project wins. A brief for a subagent names the framework layer's files alongside the core sources.

## Steps

### 1. Resolve the scope

- Uncommitted work: status plus tracked diffs; untracked files are new code too.
- Branch or merge request: diff against the merge base of the *confirmed* target. A stacked branch targets its parent feature branch, not the default branch.
- Include unchanged callers of changed code when behavior crosses them.
- Keep generated output, lockfiles, and large snapshots out of the shape passes; inspect them separately for contract consistency or visible change.
- Read the spec or ticket as the claim to verify, and confirm it is current before enforcing it. A stale spec is a question, not a requirement.

Done when you can name the base ref, the changed files, the callers in scope, and the requirement source.

### 2. Run the passes

Use read-only reviewers (subagents where available). A non-trivial feature gets two independent passes; a narrow change or follow-up gets one reviewer with the affected dimensions named. Split further for distinct risk, not file count.

A subagent sees only its brief. Each brief names the scope, the requirement source, the exemplar paths, and the absolute paths of the sources above, and tells the reviewer to read them before the diff.

- **Shape, reuse, and typing.** Compare the change with its nearest compatible exemplar and trace decisions across callers. Check every new export against the project's existing capabilities (Tier 0 first). Challenge duplicated resolution, reconstructed types, forwarding-only layers, unjustified shared placement, and abstractions justified only by a plan row. Apply the casebook's typing and structure cases *with their stated limits*.
- **Correctness and product behavior.** Trace initialization, edits, submission, refresh and retry, and navigation. Check races, stale data, identity, optional backend values, error paths, and state lifetime. Check translations, flags, analytics, accessibility, test IDs, and whether the tests assert behavior. Preserve explicit spec constraints; do not add a schema, retry policy, or validation rule as a generic preference.

Done when every applicable core and framework casebook case and hard gate has been checked against the diff — by the reviewer, not by assumption.

### 3. Hold every finding to the evidence contract

Each finding gives:

- `file:line` and the quoted code or call path;
- the violated requirement or rule, or the concrete maintenance cost;
- the smallest correction — for a reuse finding, the existing export or exemplar and why it is compatible;
- its tier (casebook) or impact (correctness).

Separate observed failures from hypothetical inputs and from preferences. Drop anything on the do-not-flag list. A finding quotes a line, or — for something missing, such as a test, translation, or flag — names the missing artifact and where it belongs; drop any finding that can do neither.

Done when every remaining finding meets the contract.

### 4. Triage against current authority

- Check each suggested fix against local patterns and the actual callers before asking for it. A fix the codebase would reject is noise.
- Legacy usage does not license new usage. Many existing call sites of a pattern reviewers now flag is still a finding.
- Report unresolved contradictions between spec, ticket, and code as questions.
- Run a separate security review when the change touches authentication, authorization, secrets, sessions, or untrusted input.

Done when every suggested fix has been checked against a caller or local pattern, and every contradiction is either resolved or listed as a question.

### 5. Close one integrated review

Deduplicate across passes. Order: correctness by impact, then Tier 0–2 rule findings grouped by tier, then Tier 3 as clearly labeled suggestions. Summarize which boundaries were reviewed and which could not be; no per-rule "checked, clean" transcript.

Report a missing test as the one or two tests that matter most, not a full matrix. If the tests a change needs would have to assert call forwarding or mock internal seams, report the seam as the finding — bad tests are often an architecture signal.

After fixes, re-review the affected findings and their callers with the same reviewer. Reopen the full passes only when design, requirements, or risk change materially.

Done when each finding is fixed, acknowledged with a reason, or listed as an open question, and the report names any verification that could not run.

## Common mistakes

- Checking imported primitives while missing a repeated workflow decision.
- Treating a reuse map or a coverage percentage as architectural approval.
- Removing a request-time guard because the initial data was already validated.
- Presenting a Tier 3 preference as a blocker.
- Re-running every pass after a local correction.
- Enforcing an unconfirmed spec, or suggesting a fix no caller supports.
