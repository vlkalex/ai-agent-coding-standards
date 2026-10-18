# Mining Review Feedback into Agent Standards

Your reviewers already wrote your coding standards, one comment at a time. This guide turns those comments into material an agent can use before the next review: a tiered rule list, a casebook of worked examples, decision docs, and lint rules.

It is the method behind [review-casebook.md](../review/review-casebook.md) and the [ESLint plugin](../eslint-plugin/README.md). Run it on your own repository: the casebook here is a starting point, and your reviewers' taste is the target.

## Why mine instead of write

Generic standards miss three kinds of comment. On the codebase this method was developed on, a baseline of 22 human comments on one agent-written merge request broke down as:

| Share | Kind | Fix |
|---|---|---|
| ~26% | **Reuse miss** — an existing helper or component was hand-rolled | A capabilities table, checked before designing |
| ~32% | **Tacit convention** — true, enforced, and written nowhere | The casebook and decision docs |
| ~16% | **Written but unenforced** — the agent's own standards covered it; its review pass skimmed past | Rule-by-rule review passes and lint rules |
| ~26% | Questions, nitpicks, FYIs | Irreducible; leave them to humans |

Only mining finds the middle two rows.

## 1. Collect the threads

Fetch review *discussions*, not merged code. The code shows what was accepted; the discussion shows what was rejected and why.

- Take a broad sweep (the last 100–150 merged merge requests, all authors) to rank themes, and a deep pass (every merge request of the authors whose code is mostly agent-written) for worked examples.
- Keep only human, non-system notes. Drop bots, CI, and dependency-update authors.
- Keep the code context each thread is attached to (file, line, and the diff hunk). A comment without its code cannot become a case.
- Record the outcome: was the thread fixed, answered without a change, or left open? An answered-without-change thread is an *accepted* pattern, and just as valuable.

An authenticated `glab` or `gh` CLI is enough: list merged merge requests, then fetch each one's discussions (`projects/:id/merge_requests/:iid/discussions` on GitLab; `repos/:owner/:repo/pulls/:number/comments` plus review bodies on GitHub) into one JSON file per merge request. Use GET requests only, and pace them.

Done when every thread in the sample is stored with its author, file, code context, and outcome.

## 2. Classify and rank

Classify each thread by theme in your team's own words — reviewers repeat phrases ("put it in a variable", "pre-type it", "this already exists"), and those phrases make good classifier patterns and good leading words for the docs. Then count each theme by thread *and* by distinct reviewer and merge request.

Expect these patterns:

- **Concentration.** One or two reviewers usually write most of the comments. Their standards *are* the review culture; weight their threads accordingly.
- **The bar.** 90 of 130 merge requests merged with zero human comments. Comment volume tracks size; small changes are the evidence that clean is achievable.
- **A short head.** Four themes covered most comments: named extraction of conditions and values, explicit types at boundaries, reuse misses, and one-component-per-file structure.

Check your existing standards against the counts. The mined sample overturned one of ours: our agent rules said "avoid snapshot tests", and the reviewers expected a component snapshot for every visible UI change.

Done when every theme has a thread count, a reviewer count, and at least one quoted example.

## 3. Tier the rules

Rank each rule by how reviewers treat it, not by how important it sounds. A rule set that is too strict is as costly as a missing one: an agent that applies one reviewer's preference everywhere gets flagged for over-abstraction instead.

| Tier | Test | Where it goes |
|---|---|---|
| 0 — Reuse | A hand-rolled version of an existing capability was flagged | Capabilities table, checked before design |
| 1 — Mechanical | Decidable from syntax alone, without types or domain knowledge | Lint rule; fixed before handoff |
| 2 — Hard review rule | Needs judgment; flagged every time, by several reviewers | Casebook and decision docs; blocking |
| 3 — Preference | One reviewer, or marked "non-blocking" / "nitpick" / "up to you" | Casebook, labeled; suggestion only |

Keep the reviewers' own severity. When a tier is your reading rather than theirs, say so.

## 4. Write the artifacts

Write three artifacts, each with one job.

**A compact rule list.** One line per rule, with its tier and its count. Agents read it during discovery and reviewers use it as their checklist. Put the Tier 0 capabilities table at the top: need, what to use, how often it was flagged.

**A casebook.** One case per rule: the code that drew the comment, the code that was accepted, and the reviewer's reason in their words. Close with **what is accepted — do not flag**: every pattern a reviewer let through after the author explained it. Without that list, agent reviewers invent findings the humans never raise. Use this shape:

````markdown
### 2.4 A decision keyed by a state is an exhaustive table

```ts
// ❌ <the flagged code, trimmed to the lines that matter>
// ✅ <the accepted code>
```

Why: "<the reviewer's reason, translated, in their words>."

<Where it stops: the limit, exception, or accepted counter-case.>
````

**Decision docs.** For a decision an implementer must make *before* writing code — how a state-driven flow navigates, where a submit button's state lives, what a screen renders while loading — write one doc an agent opens by task. The index is a table: *you are about to… → read*. Each doc has the same parts:

```markdown
# NN — <decision in a few words>

## Decision
<One paragraph: what to do.>

## Why
<The reviewers' reasons, quoted. Include the author's counter-argument if it was rejected, and why.>

## Do
<Code from the accepted fix.>

## Don't
<Code from the flagged version.>

## Exemplar
<A path in the repository that implements it today. Check it still exists.>

## Limits
<Where the decision stops applying.>

## Source
<Thread references.>
```

Keep cases and decisions distinct from interpretation. A line that is your own conclusion rather than a reviewer's is labeled as yours.

Done when every Tier 0–2 rule has a case, every case has an accepted version and a reason, and the do-not-flag list records every accepted pushback in the sample.

## 5. Promote the mechanical tier to lint

Each Tier 1 rule is a lint candidate. Before enabling one:

1. Write it with tests built from the real flagged and accepted code.
2. Run it across the whole codebase and count files hit per 100 files.
3. Read the hits. A rule that fires mostly on code reviewers accept is wrong, not strict; loosen it (the plugin's `boolean-function-prefix` accepts `getIs*` for this reason) or turn it off.
4. Ship as `error` only below about two files per 100; otherwise `warn` until the backlog is clean, or `off` as an opt-in convention.

Some Tier 1 rules need the file system or git rather than an AST — translation parity, a snapshot test beside every changed component. Write those as CI checks.

Keep domain judgment out of lint: what counts as backend data, whether two components share semantics, and whether a literal crosses a boundary stay in review.

## 6. Wire it into the work

- **Authoring.** The agent reads the rule list and capabilities table during discovery and the matching decision doc before designing.
- **Review.** Run explicit passes per dimension plus one holistic pass, every finding quoting a line and carrying its tier. See the [agent-code-review skill](../skills/agent-code-review/SKILL.md). Rule-by-rule passes caught about ten findings a single holistic reviewer missed; the holistic pass alone caught the behavioral bugs.
- **Before human review.** Address the automated review, then run the team's checklist on the diff.

## 7. Measure and maintain

- **Score each agent-written merge request against its human review.** Every human comment is either predicted by the agent review (hit), missed (a rule or case to add), or irreducible. Every agent finding the humans did not raise is a false positive — and usually a missing "do not flag" entry.
- **Track the zero-comment rate** for agent-written merge requests against the team's baseline.
- **Re-mine after a few weeks of merges**, append new cases with their date and source, and retire rules the reviewers stopped raising. A decision superseded by a newer review is marked superseded, not silently edited.
- **Let the repository win.** Where the project's committed instructions and the mined docs disagree, the committed instructions are current and the mined docs are stale.
