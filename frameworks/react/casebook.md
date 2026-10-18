# React Casebook

The React layer of the [review casebook](../../review/review-casebook.md): what strict reviewers flag in React code specifically — effects, rendering, subscriptions, memoization, hooks, and JSX. Read the core casebook first; this file adds React syntax and React-only failure modes on top of it and does not repeat the core cases.

Applies to every React renderer: web apps, Next.js, Remix, and React Native. The tiers mean the same as in the core casebook. Library-specific APIs appear only as neutral stand-ins (`form`, `useFieldValue`, `replaceRoute`).

**Server components.** In Next.js and other server-component frameworks, R1–R3, R5, R7, and R8 apply to client components only: server components have no hooks, effects, or re-renders. R4, R6, R9, and R10 apply to both.

## Index

| # | Case | Tier | Core case it extends |
|---|---|---|---|
| R1 | [An effect's condition lives above the effect](#r1-an-effects-condition-lives-above-the-effect) | 1 | 1.1 |
| R2 | [Effects stay small; cancellation belongs to one run](#r2-effects-stay-small-cancellation-belongs-to-one-run) | 2 | 6.5 |
| R3 | [Never create a component during render](#r3-never-create-a-component-during-render) | 1 | — |
| R4 | [One variant is rendered by an exhaustive `switch`, not a map built in render](#r4-one-variant-is-rendered-by-an-exhaustive-switch-not-a-map-built-in-render) | 2 | 2.5 |
| R5 | [The submit button owns its form subscription](#r5-the-submit-button-owns-its-form-subscription) | 2 | 4.3 |
| R6 | [Layout, loading, and entry routes in React](#r6-layout-loading-and-entry-routes-in-react) | 2 | 5.1, 5.5 |
| R7 | [No speculative memoization](#r7-no-speculative-memoization) | 3 | — |
| R8 | [Extract a hook for one value, not for a group of callbacks](#r8-extract-a-hook-for-one-value-not-for-a-group-of-callbacks) | 2 | 7.3 |
| R9 | [React naming](#r9-react-naming) | 3 | 8 |
| R10 | [Component files](#r10-component-files) | 2 | 7.1 |

---

### R1. An effect's condition lives above the effect

```ts
// ❌
useEffect(() => {
	if (isPending || error || !order || summary) return;
	navigation.replace(Screens.Failed, { orderId });
}, [error, isPending, order, orderId, navigation, summary]);

// ✅
const shouldShowFailure = !isPending && !error && !!order && !summary;

useEffect(() => {
	if (!shouldShowFailure) return;
	navigation.replace(Screens.Failed, { orderId });
}, [orderId, navigation, shouldShowFailure]);
```

Why: "It becomes one dependency of the effect and reads better." The same holds for `useMemo` and `useCallback` dependencies: a property path (`order.status`) in a dependency array becomes a named const above the hook.

### R2. Effects stay small; cancellation belongs to one run

An effect body is a guard, a call to a named function, and a cleanup. Async work, handlers, and decisions live in named functions or their own hooks.

- No `let` counters, `while` loops, or `Date.now()` pacing in hooks. Use the project's cancellable timeout hook plus a state value the effect depends on.
- Cancellation belongs to one effect run (core 6.5). Create it inside the run and cancel it in that run's cleanup — no `let` flag, and no ref shared across runs, where a later run can un-cancel a stale one:

```ts
useEffect(() => {
	const controller = new AbortController();
	void loadDraft({ signal: controller.signal });
	return () => controller.abort();
}, [loadDraft]);
```

### R3. Never create a component during render

A component type *created* during render (an inline function component, a `useCallback`-wrapped one) is a new type on every render, so its subtree remounts and loses state every time. A type *chosen* during render does not remount on every render, but it hides which elements can appear and trips the static-components lint rule. Fix the cause, in this order:

1. A variant picked by a condition: choose the **element**, not the component.
2. A component that needs extra data from its parent: define it at module scope and pass the data as props.
3. A component picked from a module-level map: its identity is stable; render it and add a lint-disable comment saying why.

```tsx
// ❌
const Overview = isCompact ? CompactOverview : FullOverview;
return createElement(Overview, { filter });

// ✅
const overviewElement = isCompact ? <CompactOverview filter={filter} /> : <FullOverview filter={filter} />;
```

Never hide the remount from the linter with `createElement(Component)`, `Component()`, or a `useCallback`-wrapped component.

### R4. One variant is rendered by an exhaustive `switch`, not a map built in render

```tsx
// ❌ a map of elements built inside render: every variant is created on every render
const fieldsByVariant: Record<Variant, JSX.Element> = {
	[Variant.person]: <PersonFields fieldNames={fieldNames} />,
	[Variant.company]: <CompanyFields fieldNames={fieldNames} />,
};
return fieldsByVariant[variant];

// ✅ its own component
switch (variant) {
	case Variant.person:
		return <PersonFields fieldNames={fieldNames} />;
	case Variant.company:
		return <CompanyFields fieldNames={fieldNames} />;
	default: {
		variant satisfies never;
		return null;
	}
}
```

Do not `return variant satisfies never`: at runtime it returns the raw string — a stray text node on the web, a crash in React Native outside a text component. A module-scope map of prop-less elements is fine: it is created once. The `no-element-map-in-render` lint rule catches the ❌ form.

### R5. The submit button owns its form subscription

```tsx
// ❌ the parent holds the selection; every change re-renders the whole screen
const [selectedId, setSelectedId] = useState<string>();
const appearance = isValid ? 'primary' : 'muted';
footer={<Button appearance={appearance} disabled={!isValid} onPress={onSubmit} />}

// ❌ half-fix: the button moved to its own component, the state did not
// ✅ the parent creates the form and passes the form handle down
const form = useSelectionForm();
<ConfirmSelectionButton form={form} options={options} onConfirm={confirm} />

// inside ConfirmSelectionButton: subscribe to the one field it needs
const selectedId = useFieldValue(form, 'selectedId');
const selectedOption = findOption(options, selectedId);
const isSubmitDisabled = !selectedOption || isConfirming;
```

Why, over three reviews: the project's submit button already owns the appearance logic; "always put the submit button in its own component with its related logic — otherwise it re-renders the whole screen"; then, on the half-fix, "there is almost no benefit, because the state still lives above the whole layout. Pass the form to the button and handle the form state inside it."

The point of the separate component is that form-state changes re-render only the button. Extracting the JSX without moving the subscription achieves nothing. A single-choice selection is a one-field form, not a `useState`. Every mainstream form library has a handle to pass down and a per-field subscription; use those.

### R6. Layout, loading, and entry routes in React

Core cases 5.1 and 5.5 in JSX:

```tsx
// ❌ the whole screen waits inside the loading boundary
<AsyncContent data={summary} isLoading={isLoading} error={error}
	render={() => <ScreenLayout footer={...}>...</ScreenLayout>} />

// ✅ layout outside, one loading boundary per region
<ScreenLayout footer={<AsyncContent data={summary} ... render={renderFooter} />}>
	<AsyncContent data={summary} ... render={renderContent} />
</ScreenLayout>
```

With Suspense, the same rule reads: the boundary wraps the region, not the page.

A route that can be the flow's entry redirects when it is first and no longer matches the backend state:

```ts
const shouldRedirect = isEntryRoute && currentRoute !== entryRoute;

useEffect(() => {
	if (!shouldRedirect) return;
	replaceRoute(entryRoute);
}, [shouldRedirect, replaceRoute, entryRoute]);
```

In a framework with file-based routing, prefer its redirect mechanism (in a server component or route loader) over a client effect.

Optional chaining on a navigation object (`navigation?.navigate`) needs a stated reason and usually an `else`. When navigation is on demand, use the project's helper that guarantees a navigation object.

### R7. No speculative memoization

No `memo` on a route-level component that takes no props — "the optimization is already built in"; the comparison costs and saves nothing. No `memo`, `useMemo`, or `useCallback` elsewhere without a measured cost or an identity contract a consumer depends on. See [component-guidelines.md](./component-guidelines.md#memoization).

### R8. Extract a hook for one value, not for a group of callbacks

```ts
// ✅ a store selector, a feature flag, a query, and an availability check exist only to produce `items`
const items = useOrderActionItems({ orderId });
```

The opposite is flagged: "For me this hook makes no sense, I don't see the added value. What bothers me is the grouping itself." A hook that collects three unrelated navigation callbacks should be split so each callback sits next to the popup it feeds. Hooks take one object typed by a named `Params` type (core case 2.8).

### R9. React naming

| Flagged | Accepted | Reason |
|---|---|---|
| `errorElement` for JSX that may be `null` | `maybeErrorElement` | The element may be absent |
| `useSelectorNavigation` returning a navigate function | `useNavigateToSelector` | Reads as returning the navigation object |
| `useFeature()` returning a boolean | `useIsFeatureEnabled()` | A boolean hook reads as a question |

### R10. Component files

Core case 7.1 in React terms: one component per file, a file with no JSX is `.ts` rather than `.tsx`, and a component's hooks sit beside it (a `hooks/` subfolder is a Tier 3 preference). The `one-component-per-file` and `no-tsx-without-jsx` lint rules check both mechanically.

---

## What is accepted — do not flag

- `ReturnType<typeof useOrderForm>` as the type of a hook's controller object.
- An inline conditional spacer such as `{shouldAddSpacer && <Spacer />}` when it is local practice.
- A `key` built from value and index when the value really is not unique.
