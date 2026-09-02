# eslint-plugin-ai-agent-standards

ESLint rules that mechanize the review comments human reviewers keep leaving on AI-agent-written React / React Native / TypeScript code. Each rule exists because a strict reviewer flagged the pattern repeatedly on real merge requests; the goal is that those comments never need typing again.

Framework-agnostic (React, React Native, plain TypeScript), ESLint 9 flat config.

## Install

```bash
npm i -D eslint-plugin-ai-agent-standards        # or: npm i -D /path/to/this/folder
```

```js
// eslint.config.js
const aiAgentStandards = require('eslint-plugin-ai-agent-standards');

module.exports = [
  aiAgentStandards.configs.recommended,   // bundles @typescript-eslint parser + stock rules
  // or, if you already configure TypeScript parsing:
  // aiAgentStandards.configs['rules-only'],
  {
    rules: {
      // project-specific tribal knowledge, opt in:
      'ai-agent-standards/no-banned-identifiers': ['error', {
        convertErrorToAppError: 'de-facto deprecated; use createAppErrorFromMessage',
      }],
      'ai-agent-standards/no-inline-noop': ['error', { noopName: 'noop', importSource: '@app/helpers/noop' }],
    },
  },
];
```

## Rules

| Rule | Review comment it replaces | Default |
|---|---|---|
| `named-condition` | "Do proměnné" / "put it in a variable" — compound conditions must be named booleans. Flags >1 logical operator, or any inline expression (comparison, call) as an operand of `&&`/`\|\|`. Options: `maxLogicalOperators` (1), `allowComparisonOperands` (false). | error |
| `named-hook-deps` | Effect/memo dependency arrays may only hold identifiers; `a.b`, `a?.b` get extracted to named consts above the hook. Options: `hooks`, `additionalHooks` (regex). | error |
| `one-component-per-file` | "Components never share a file." Any second top-level uppercase function that renders JSX (incl. `memo`/`forwardRef`-wrapped). Option: `allowNonExported` (false). | error |
| `no-double-type-assertion` | `x as unknown as T` — validate at the boundary instead. | error |
| `no-tsx-without-jsx` | ".ts when there is no JSX." Reports on `.tsx` files that contain no JSX. | warn |
| `no-inline-noop` | "noop already exists in the codebase." Flags `() => {}` in props, arguments, object values. Options: `noopName`, `importSource`. | error |
| `no-repeated-jsx-literal-prop` | "Same `category` three times — put it in a const or a wrapping component." Options: `min` (3), `perElement` (true), `ignoreProps`. | warn |
| `no-verbose-comments` | "AI makes these comments needlessly long." Line-comment runs > `maxLines` (3), block comments > `maxLines`, JSDoc > `maxJsDocLines` (12). Skips directives and license/`@see` headers. | warn |
| `no-banned-identifiers` | Deprecated-in-spirit helpers nobody tagged `@deprecated`. Map of name → reason. | off (opt in) |
| `prefer-named-types` | "Hodně inline typů, vytáhnul bych do separátních typů" — inline object types with ≥ `minMembers` (3) in annotations/generics/intersections. | warn |
| `boolean-function-prefix` | "check/is prefix please — `get` doesn't read as a boolean." Flags `get*` functions whose body/return type is boolean-shaped; `getIs*`/`getHas*` are accepted (the predicate word does the job). Options: `forbiddenPrefix`, `suggestedPrefixes`, `allowPredicateAfterPrefix`. | error |
| `maybe-prefix-conditional-element` | `const maybeErrorElement = cond ? <X/> : null` — conditionally rendered element consts carry the `maybe` prefix. Option: `prefix`. | off (opt in) |
| `require-call-in-file` | "Every story ships with tracking" — files matching a regex must call given functions (e.g. every `*Screen.tsx` calls the analytics + page-view hooks). Fully project-configurable. | off (opt in) |
| `no-optional-boolean` | "Pročpak undefined?" — `flag?: boolean` / `boolean \| undefined`. A Tier-3 preference; enable per project. | off (opt in) |

`recommended` also enables stock rules for the rest of the mechanical tier: `no-nested-ternary`, `complexity` (12), `max-lines` (250), `max-lines-per-function` (120), `@typescript-eslint/no-explicit-any`, `no-non-null-assertion`, `consistent-type-assertions` (no object-literal casts).

## Calibration (why the defaults are what they are)

Run once over a 10,876-file React Native codebase with a strict review culture. Files hit per 100 files:

| Rule | files/100 | Verdict |
|---|---|---|
| `named-condition` | 1.5 | low noise on a strict codebase → `error` |
| `named-hook-deps` | 0.5 | `error` |
| `one-component-per-file` | 0.3 | `error` |
| `no-inline-noop` | 0.1 | `error` |
| `no-double-type-assertion` | 0.6 (mostly tests) | `error` |
| `prefer-named-types` | 0.3 | `warn` |
| `no-repeated-jsx-literal-prop` | 0.3 | `warn` |
| `no-verbose-comments` | 0.8 | `warn` |
| `boolean-function-prefix` | 1.2 before / ~0.1 after allowing `getIs*` | `error` |
| `no-tsx-without-jsx` | 3.9 — real, but a legacy backlog | `warn` until clean |
| `maybe-prefix-conditional-element` | 1.6 — codebase doesn't use the convention | `off` |
| `no-optional-boolean` | 5.6 | `off` (preference) |
| `require-call-in-file` | depends entirely on patterns | `off` (opt in) |

Do the same run on your codebase before promoting anything to `error`: `eslint --format json` and count hits per rule.

## Checkers (CI / Danger scripts, not ESLint)

Two review rules are mechanical but need the file system or git rather than an AST:

```bash
npx check-translation-parity packages/translations/src/content --forbid 'Kč|€' [--reference cs]
#   every locale folder must carry the same keys per file; values must not match forbidden patterns
npx check-snapshot-coverage --base master [--component 'components/.*\.tsx$'] [--test-suffix .comp.test.tsx] [--strict]
#   every changed/added component file (committed since base + working tree) needs a sibling component test
```

Both exit non-zero on failure (`--strict` for the snapshot checker) so they drop straight into a pipeline or a `dangerfile`.

## What is deliberately NOT a lint rule

These recur in reviews but need domain knowledge a linter doesn't have; keep them as agent review-checklist items:

- Branching on raw backend strings (what counts as "backend data" is semantic).
- Reusing an existing component/helper instead of hand-rolling one (needs a capabilities catalog).
- Outer margins/spacing baked into exported components (style semantics vary per design system).
- Pre-typing "at boundaries" (which literals cross a boundary is a judgment call; `consistent-type-assertions` covers the mechanical part).
- Tracking, accessibility, translations parity, feature-toggle coverage (product completeness).

## Origin

Rules were mined from ~220 human review threads across ~135 merge requests by 15 authors on a strict React Native banking codebase, then tiered by frequency. Named extraction alone accounted for 20 comments across five MRs — eight in a single MR.

## Development

```bash
npm test   # RuleTester suites for every rule
```
