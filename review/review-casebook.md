# Review Casebook

Worked examples of what strict human reviewers flag on agent-written TypeScript code, and what they let through. This is the core layer: every case holds in any TypeScript codebase, whatever framework renders it. Examples use plain TypeScript and neutral stand-ins (`form`, `pollInterval`, `routes`) instead of library or framework APIs.

Framework-specific cases — effects, render cycles, component syntax — live in framework layers, installed as `<framework>-standards` skills and loaded only for work in that framework. Each case shows the code that drew the comment, the code that was accepted, and the reviewer's reason.

The cases come from a few hundred human review threads on a large React Native codebase: a sweep of 130 merged merge requests by 15 authors, plus a deep pass over one author's complete merge-request history. Identifiers, domains, and components are renamed to generic ones. The reasons are the reviewers' own, translated.

Use it two ways:

- **Authoring.** Read the section matching the code you are about to write. The cheapest review round is the one the casebook prevents.
- **Reviewing.** Match the diff against the cases, quote the real line, and give the reason. Check [What is accepted](#what-is-accepted--do-not-flag) before reporting; flagging an accepted pattern costs the author a round trip for nothing.

Your project's reviewers will differ in places. Treat this file as a starting casebook, then replace its cases with your own using [mining-review-feedback.md](../workflow/mining-review-feedback.md).

The tiers reflect the codebase the cases were mined from. Structure and placement cases (2.8, 5.2, 7.1, 7.2) are that team's conventions: adopt them where your project shares them, and otherwise let the [Local Consistency Rule](./quality-gate.md#local-consistency-rule) decide.

## Tiers

Every case carries a tier. A review reports the tier with each finding and never presents a Tier 3 suggestion as a blocker.

| Tier | Meaning | Handling |
|---|---|---|
| **0 — Reuse** | An existing capability was not used. Agents miss these most often. | Blocking. Check before designing. |
| **1 — Mechanical** | Decidable from the syntax. A lint rule could catch these. | Blocking, but should never reach a human. Fix before handoff. |
| **2 — Hard review rule** | Needs judgment, and reviewers flag it every time. | Blocking. |
| **3 — Preference** | One reviewer's taste, or marked "non-blocking" / "up to you". | Suggestion only. Apply when cheap; never refactor working code for it. |

Across the mined threads the most frequent themes were, in order: named conditions and values (about a quarter of all comments), pre-typing, an existing capability not used, file and component structure, naming, layout, and the backend contract. Comment volume follows merge-request size: most small merge requests merge with no human comment at all, and that is the bar.

## Scope

Every case also carries a scope.

| Scope | Applies to |
|---|---|
| **TS** | Any TypeScript code: UI or server, any framework. |
| **UI** | User-facing apps in any framework: screens, routes, layout, and product completeness. |

## Index

| # | Case | Tier | Scope |
|---|---|---|---|
| 1.1 | [A multi-part condition gets a name](#11-a-multi-part-condition-gets-a-name) | 1 | TS |
| 1.2 | [Evaluate above the object or call that uses it](#12-evaluate-above-the-object-or-call-that-uses-it) | 1 | TS |
| 1.3 | [Condition first, then the value](#13-condition-first-then-the-value) | 1 | TS |
| 1.4 | [Literals with meaning get a name](#14-literals-with-meaning-get-a-name) | 1 | TS |
| 2.1 | [Pre-type what you declare and pass on](#21-pre-type-what-you-declare-and-pass-on) | 2 | TS |
| 2.2 | [Annotate, do not cast](#22-annotate-do-not-cast) | 1 | TS |
| 2.3 | [Import the exported type, do not derive it from a signature](#23-import-the-exported-type-do-not-derive-it-from-a-signature) | 2 | TS |
| 2.4 | [A decision keyed by a state is an exhaustive table](#24-a-decision-keyed-by-a-state-is-an-exhaustive-table) | 2 | TS |
| 2.5 | [One variant is chosen by an exhaustive `switch`](#25-one-variant-is-chosen-by-an-exhaustive-switch) | 2 | TS |
| 2.6 | [Resolve "may be undefined" once, at the source](#26-resolve-may-be-undefined-once-at-the-source) | 2 | TS |
| 2.7 | [A parameter the behavior depends on is required](#27-a-parameter-the-behavior-depends-on-is-required) | 2 | TS |
| 2.8 | [Functions take one typed params object](#28-functions-take-one-typed-params-object) | 2 | TS |
| 3.1 | [Never branch on a raw backend string](#31-never-branch-on-a-raw-backend-string) | 2 | TS |
| 3.2 | [Optional backend values stay optional](#32-optional-backend-values-stay-optional) | 2 | TS |
| 3.3 | [Ask what happens with zero items, or several](#33-ask-what-happens-with-zero-items-or-several) | 2 | TS |
| 3.4 | [Currency travels with the amount](#34-currency-travels-with-the-amount) | 2 | TS |
| 3.5 | [API types come through a version-agnostic layer](#35-api-types-come-through-a-version-agnostic-layer) | 3 | TS |
| 4.1 | [Form field paths are declared, never concatenated](#41-form-field-paths-are-declared-never-concatenated) | 2 | TS |
| 4.2 | [A handler's guard and its button's `disabled` are one value](#42-a-handlers-guard-and-its-buttons-disabled-are-one-value) | 2 | TS |
| 4.3 | [The submit control owns the form state it shows](#43-the-submit-control-owns-the-form-state-it-shows) | 2 | UI |
| 5.1 | [The layout renders before the data](#51-the-layout-renders-before-the-data) | 2 | UI |
| 5.2 | [Spacing belongs to the parent](#52-spacing-belongs-to-the-parent) | 2 | UI |
| 5.3 | [Footer actions go through the layout's API](#53-footer-actions-go-through-the-layouts-api) | 0 | UI |
| 5.4 | [Fix scrolling with layout, not inflated numbers](#54-fix-scrolling-with-layout-not-inflated-numbers) | 2 | UI |
| 5.5 | [Routes are declared statically](#55-routes-are-declared-statically) | 2 | UI |
| 6.1 | [Success handlers handle success](#61-success-handlers-handle-success) | 2 | TS |
| 6.2 | [Error messages say what happened](#62-error-messages-say-what-happened) | 2 | TS |
| 6.3 | [Polling cached data is declarative](#63-polling-cached-data-is-declarative) | 2 | TS |
| 6.4 | [Know what keeps a mutation pending](#64-know-what-keeps-a-mutation-pending) | 3 | TS |
| 6.5 | [Cancellation belongs to the operation that started it](#65-cancellation-belongs-to-the-operation-that-started-it) | 2 | TS |
| 7.1 | [One component per file; definitions beside it](#71-one-component-per-file-definitions-beside-it) | 2 | UI |
| 7.2 | [A generic pure function is a tested util](#72-a-generic-pure-function-is-a-tested-util) | 2 | TS |
| 7.3 | [Group code by purpose, not by screen](#73-group-code-by-purpose-not-by-screen) | 2 | TS |
| 7.4 | [Reuse a near-identical component by moving it down](#74-reuse-a-near-identical-component-by-moving-it-down) | 0 | UI |
| 7.5 | [A messy file gets restructured, not annotated](#75-a-messy-file-gets-restructured-not-annotated) | 3 | TS |
| 7.6 | [Pass the object once you pick more than two of its fields](#76-pass-the-object-once-you-pick-more-than-two-of-its-fields) | 3 | TS |
| 7.7 | [Frequently missed capabilities](#77-frequently-missed-capabilities) | 0 | UI |
| 8 | [Naming](#8-naming) | 3 | TS |
| 9 | [Comments](#9-comments) | 1 | TS |
| 10 | [Product completeness](#10-product-completeness) | 2 | UI |
| 11 | [Before review, and answering it](#11-before-review-and-answering-it) | — | All |
---

## 1. Named conditions and values

The single most frequent comment, from every reviewer. The rule they post on every merge request: *named conditions, correctly named functions, constants and types, one const per calculation.*

### 1.1 A multi-part condition gets a name

```ts
// ❌
if (!order || error || !checkIsCancellable({ order })) {
	showCancelFailure({ orderId });
	return;
}

// ✅
const isCancellable = order ? checkIsCancellable({ order }) : false;
const shouldShowFailure = !!error || !isCancellable;

if (shouldShowFailure) { ... }
```

Why: "I see room for one or two more consts; it helps you understand the `if` faster."

The comment lands on short conditions too, whenever they combine two facts or contain a call:

```ts
// ❌                                          // ✅
if (isPending || nextTab === tab) return;      const isTabSwitchBlocked = isPending || nextTab === tab;
                                               if (isTabSwitchBlocked) return;

if (tryLockSubmit()) return;                   const isSubmitLocked = tryLockSubmit();
                                               if (isSubmitLocked) return;

if (offers.length === 0) return [];           const hasNoOffers = offers.length === 0;
```

In reactive code — effects, watchers, computed values — the named condition also replaces several dependencies with one. Framework layers show the syntax.

**Where it stops.** A guard on one existing variable (`if (!params) return;`) is never flagged. A const that only renames something (`const CATEGORY = Category.orders`) is flagged as needless. Name conditions and calculations; do not alias property reads.

### 1.2 Evaluate above the object or call that uses it

```ts
// ❌                                       // ✅
return {                                    const isDisabled = !content.isAvailable || isPending;
	disabled: !content.isAvailable || isPending,
	...                                     return { disabled: isDisabled, ... };
};
```

The same applies to arguments: build `const reloadState = { reload, isReloading }` above the call instead of a ternary of object literals inside it. A function's returned object and a component's inputs are a plain list of names; every value is computed above.

### 1.3 Condition first, then the value

```ts
// ❌ value is `false | undefined | Order`, and a second calculation hides inside the call
const updatedOrder = editedItem && setOrderItem({ order, item: composeItem(editedItem) });
saveOrder(updatedOrder);

// ✅
if (!editedItem) return saveOrder(undefined);

const item = composeItem(editedItem);
const updatedOrder = composeOrderWithItem({ order, item });

saveOrder(updatedOrder);
```

Why: "I'd split it into a condition and then a variable."

### 1.4 Literals with meaning get a name

- A bare `decimals: 2` becomes `DISCOUNT_DECIMALS`.
- The same literal input on three elements in one file (a text variant, say) becomes one const. If the combination recurs across the task, consider one small component.
- A path or code string compared inline (`path === '$.items.quantity'`) becomes a const with a one-line comment saying where it comes from.
- Test IDs built by the same template per enum member become one composing function.

---

## 2. Typing

### 2.1 Pre-type what you declare and pass on

Give an explicit type to arrays and objects declared in a function or component and passed on, to a const chosen between string literals, to config maps, and to test fixtures.

```ts
// ❌
const items = canCancel ? [Action.upload, Action.cancel] : [Action.upload];
const appearance = isValid ? 'primary' : 'muted';
const contextValue = { ...query, orderId, isReadOnly };

// ✅
const items: OrderAction[] = canCancel ? [Action.upload, Action.cancel] : [Action.upload];
const appearance: ButtonAppearance = isValid ? 'primary' : 'muted';
const contextValue: OrderContextValue = { ...query, orderId, isReadOnly };

// fixtures and config maps: satisfies
const validValues = { [Field.amount]: 2_600_000 } satisfies Partial<Record<Field, unknown>>;
```

Why: "It states the intent and it guards it." A type error then shows at the definition, not at some distant use. A literal that needs `'x' as const` to fit somewhere is the tell.

When the type is long, name it instead of writing it inline: `type HiddenFieldsByDeliveryMode = Record<DeliveryMode, Field[]>`.

**Where it stops.** Return types on helpers are welcome but not required — never flag either way ("the developer shows their intent with it"). Types taken from a factory's return (`ReturnType<typeof createOrderForm>`) are accepted idiom. Local literals that stay inside one function need no annotation.

### 2.2 Annotate, do not cast

```ts
// ❌                                                  // ✅
const slides = tArray('onboarding.slides') as Slide[];  const slides: Slide[] = tArray('onboarding.slides');
```

Why: "Is the cast needed? The type should already be right." An annotation is checked; a cast is a claim. No `any`, no `as unknown as T`, no non-null `!`. `as const` is fine.

### 2.3 Import the exported type, do not derive it from a signature

```ts
// ❌
type Options = Parameters<typeof api.getOrder>[1];
// ✅
import type { GetOrderOptions } from '@app/api/orders';
```

A type reconstructed from a callee's signature breaks silently when the signature changes shape and tells the reader nothing. If the library exports the type, import it; if it does not, name it once at the boundary.

### 2.4 A decision keyed by a state is an exhaustive table

```ts
// ❌ three partial maps, each lookup needs a fallback
const sectionsByState: Partial<Record<State, Section[]>> = { ... };
const isEnabled = sectionsByState[state]?.includes(section) ?? false;

// ✅ one table, one row per state, every state present
const defaultConfig: StateConfig = { entryRoute: RouteName.hub, enabledSections: [], banner: undefined };

const configByState = {
	[State.DRAFT]: { ...defaultConfig, enabledSections: [Section.items, Section.address] },
	[State.PROCESSING]: { ...defaultConfig, banner: Banner.processing },
	[State.NEEDS_SELECTION]: { ...defaultConfig, entryRoute: RouteName.selection },
	[State.APPROVED]: defaultConfig,
	// …every remaining state, one line each
} satisfies Record<State, StateConfig>;

const isEnabled = configByState[state].enabledSections.includes(section);
```

Why: "I would keep the definition for all states so it warns you when one is added. With `Partial` you switch that protection off." Prefer `satisfies Record<…>` on the literal to an annotation on the const. When several things depend on the same state, they share one table.

The author's argument — the enum has about 40 states and most never occur in this flow — was not accepted: the compile error on a new state is the point. A shared default row keeps the unused states to one line each. Measure your codebase's convention before arguing for `Partial`; in the mined codebase exhaustive maps outnumbered partial ones about eight to one.

The general form, from the reviewers' checklist: *check whether the `if` you wrote can be a typed map. The fewer ifs, the more durable the app.*

### 2.5 One variant is chosen by an exhaustive `switch`

```ts
// ❌ an `if` chain with an untyped fall-through: a new method silently gets the post fee
if (method === Delivery.pickup) return 0;
if (method === Delivery.courier) return COURIER_FEE;
return POST_FEE;

// ✅
switch (method) {
	case Delivery.pickup:
		return 0;
	case Delivery.courier:
		return COURIER_FEE;
	case Delivery.post:
		return POST_FEE;
	default: {
		method satisfies never; // compile error when a method is added
		return undefined; // a value from a newer backend gets a safe fallback, never the raw value
	}
}
```

When each variant renders different UI, the switch lives in its own small component. Framework layers show the rendering form and its pitfalls.

### 2.6 Resolve "may be undefined" once, at the source

```ts
// ❌
export const getShippingZone = (address: Address | undefined) => {
	if (!address) return undefined;
	...

// ✅ the helper takes the defined value; the caller checks once
export const getShippingZone = ({ countryCode }: Address) => { ... };
```

Why: "When the first line of a function is 'do nothing if the parameter is not defined', the `if` is extra. Evaluate existence at the source, then reuse the defined value everywhere. It lowers complexity exponentially: fewer ifs, no undefined types, no question marks."

Exception: a helper with many callers, where nobody wants to repeat the check.

### 2.7 A parameter the behavior depends on is required

```ts
// ❌                                         // ✅
const getQuantityRule = (max?: number) =>     const getQuantityRule = (max: number | undefined) =>
```

Why: "Without the limit the rule makes no sense. With `number | undefined` the developer has to pass it." The same reasoning makes a required `boolean` better than `boolean | undefined` unless optionality is genuinely spread across callers (Tier 3).

### 2.8 Functions take one typed params object

```ts
// ❌                                            // ✅
startOrderPolling(orderId, true, options);       type Params = { orderId: string; isEnabled: boolean };
                                                 startOrderPolling({ orderId, isEnabled });
```

Positional arguments and pass-through `options` bags hide what each call means. One object typed by a named `Params` type reads at the call site and extends without breaking callers.

---

## 3. Backend contract

### 3.1 Never branch on a raw backend string

```ts
// ❌ the app depends on a string the backend may change at any time
if (data.status === 'PAYMENT_DECLINED') { ... }
type CheckoutState = 'DRAFT' | 'PAYING' | 'PAID'; // re-declares backend states by hand

// ✅ use the generated enum or type; route on it directly
import { CheckoutStatus } from '@app/api/types/checkout';
if (data.status === CheckoutStatus.PAYMENT_DECLINED) { ... }
```

Why: "When something depends on a string from the backend it is almost always wrong. How can you rely with a clear conscience on the backend sending this and never changing it?"

A hand-written union that re-declares or summarises backend states is the same problem with extra steps. Mapping a typed response into a local result union for routing (case 6.1) is fine: it starts from the generated type. A purely local union (button states, UI modes) is fine, but reviewers will ask "what is this based on?" — make it an enum beside its component or name it so the origin is obvious. A code or path with no generated type is a named const with a one-line provenance comment.

### 3.2 Optional backend values stay optional

No invented defaults on backend data, especially money: `amount ?? 0` turns "unknown" into "zero". Guard array length before indexed access. Render the absent state on purpose.

### 3.3 Ask what happens with zero items, or several

```ts
// ❌
state: accounts[0].state,
```

"What if the user has two accounts and the first is pending and the second active?" When a reviewer sees `[0]` describe a whole list, they ask this. Usually the aggregate view does not need the field at all.

### 3.4 Currency travels with the amount

```jsonc
// ❌ "totalLabel": "Order total in USD"
// ✅ "totalLabel": "Order total in {{currency}}"
```

Why: "Hardcoding the currency is wrong in principle: we support several languages and markets, and the label differs by language too." The label comes from the project's currency-label helper and is passed in as a parameter.

If the backend sends an amount without a currency, ask for it: "It makes no sense to send an amount but not a currency; other services send the whole amount object." Until it arrives, the hardcoded code carries a TODO with the backend ticket.

### 3.5 API types come through a version-agnostic layer

```ts
// ❌ import type { AttributeV0x1 } from '@api/generated/catalog';
// ✅ import type { Attribute } from '@api/types/catalog';
```

Why: "Fewer changes when migrating to a newer API version." Applies where the project already keeps such a layer.

---

## 4. Forms

### 4.1 Form field paths are declared, never concatenated

```ts
// ❌ the `as const` is the tell
const postalCodePath = `${recipientPath}.postalCode` as const;
const streetField = form.field(`${recipientPath}.street`);

// ✅ every path written out, checked where it is declared
export const RECIPIENT_ADDRESS_FIELD_NAMES = {
	0: {
		street: 'recipients.0.address.street',
		postalCode: 'recipients.0.address.postalCode',
	},
	1: {
		street: 'recipients.1.address.street',
		postalCode: 'recipients.1.address.postalCode',
	},
} satisfies Record<number, Record<string, TypedPath<CheckoutForm>>>; // your form library's typed-path type, or your own

export type RecipientIndex = keyof typeof RECIPIENT_ADDRESS_FIELD_NAMES; // 0 | 1, not number

const fieldNames = RECIPIENT_ADDRESS_FIELD_NAMES[recipientIndex];
const streetField = form.field(fieldNames.street);
```

Why: "Declaratively through a map please, without a parameter in the string. This is a dangerous way to define it." Raised on every occurrence.

How to get there: find the real bound on the dynamic index (here the checkout allows the buyer plus one gift recipient), narrow its type to that bound, and declare the paths per index. The map is long, and that was accepted over string building: each path is type-checked where it is declared, and a typo cannot hide in a concatenation. Field components take the `fieldNames` set as an input.

### 4.2 A handler's guard and its button's `disabled` are one value

```ts
const isSubmitDisabled = !selectedItem || isConfirming;
const onSubmit = () => {
	if (isSubmitDisabled) return;   // not a second, slightly different check
	confirm(selectedItem.id);
};
```

Two separate checks drift. Where the handler needs a narrowing check for the type (`if (!selectedItem) return;`), the disabled const must include that same condition — and then the guard is accepted when explained ("it is only for TypeScript; the button is disabled without a selection").

### 4.3 The submit control owns the form state it shows

The parent creates the form and hands it down. The submit control reads the validity and the fields it depends on itself and derives its own disabled and loading state. The parent does not mirror form state in its own variables and pass it back down: a selection is a one-field form, not a separate piece of parent state.

Why: "There is almost no benefit [from a separate button component], because the state still lives above the whole layout. Pass the form to the button and handle the form state inside it." Moving the markup into a child without moving the state ownership changes nothing. How a re-render or change-detection cost follows from this differs by framework; the framework layer shows the concrete form.

---

## 5. Screens and layout

### 5.1 The layout renders before the data

```text
❌ page = loadingBoundary( layout( header, content, footer ) )      // empty page until everything loads
✅ page = layout( header, loadingBoundary(content), loadingBoundary(footer) )
```

Why: "Then the whole page is empty until it loads. The page should already have its contours before loading — better for the user. The layout does not have to wait for data." Each data-dependent region gets its own loading, error, and empty handling. If sibling screens in the same feature wrap differently, follow the siblings and say so.

### 5.2 Spacing belongs to the parent

```text
❌ OrderSummaryHint = spacedStack( hint )              // exported component brings its own outer margin
✅ OrderSummaryHint = hint
   footer = spacedStack( OrderSummaryHint )           // the place of use adds spacing
```

Why: "This way the spacing is partly hidden, which leads to UI spacing bugs. Put spacing at the place of use, where it is transparent." Internal spacing between a component's own children is fine. The component is also named for what it is (`…SummaryHint`), not where it sits (`…ListFooter`): "the slot already tells you it is a footer."

### 5.3 Footer actions go through the layout's API

```text
❌ layout( footer = stack( button, button, gap = s ), buttonCountOverride = 2 )
✅ layout( buttons = buttonPair( primary = confirm, secondary = cancel ) )   // the layout's own actions API
```

Why: "We have the component — use it to keep consistency. Here we are already duplicating UI (spacing), and you have to justify the override." Content other than buttons (hints, legal text) belongs in the layout body, not the footer — a design-system rule.

A pattern with many legacy usages (the override had about 60) is still flagged in new code. Precedent is not permission.

### 5.4 Fix scrolling with layout, not inflated numbers

```text
❌ orderList( footerActionCount = 2 )    // one real button, but the list is told there are two
```

"I see only one button. I suspect the list does not scroll far enough and you are hotfixing it. Wrap the list in a flex container and pass the real number." Also pass one scroll-padding mechanism, not two that add up.

Verify before review: render the same item many times so the list overflows, and try large font sizes on a narrow display.

### 5.5 Routes are declared statically

```ts
// ❌ routes exist or not depending on backend state
const routes = [hasHub && hubRoute, needsSelection && selectionRoute].filter(Boolean);

// ✅ every route declared; the state picks the entry route
const routes = [hubRoute, selectionRoute];
const entryRoute = ENTRY_ROUTE_BY_STATE[orderState];
```

Why: "A screen always exists; the user just may not navigate to it." Two concrete risks: deep links generated from the route tree break, and someone can navigate to a route that does not exist in the current state. The exception is an authentication gate, which is state-driven on purpose.

A route that can be the flow's entry redirects to the state's entry route when it is first and no longer matches the state. With file-based routing, routes are static by construction and only the redirect remains. The author's goal — a flow that follows the backend — survived. Only the mechanism changed.

---

## 6. Errors and async flows

### 6.1 Success handlers handle success

```ts
// ❌
onSuccess: ({ data }) => {
	const wasHandled = handleSuccess(data);
	if (wasHandled) return;
	showErrorPopup({ error: toAppError(new UnknownError()), retry: initialize });
},

// ✅
onSuccess: ({ data }) => routeCheckoutResult(data),
onError: (error) => showRetryPopup({ error, retry: initialize }),
```

Why: "Why is the error popup triggered on success? The whole construction is strange." A response that is technically a success but means "cannot continue" (failed checks, a missing id) is a typed result to route on, with its own screen or popup — not an invented exception. A boolean-returning `handleSuccess` was the root of it: it made the success callback own a failure branch.

### 6.2 Error messages say what happened

"Specific errors please, not this generic one — tell the user nicely what happened." No generic "unknown" error where the cause is known. Do not add new usages of a helper the team has stopped using, even if it is not tagged `@deprecated` yet — ask. Never silence error logging for a whole endpoint without a stated reason.

### 6.3 Polling cached data is declarative

Polling data the screen renders from uses the data layer's own polling interval, only in states where the server is genuinely transitioning, and stops on error. The interval decision is a named, testable function:

```ts
pollInterval: (result) =>
	getOrderPollInterval({
		status: result.data?.status,
		isAwaitingConfirmation,
		isAppFocused,
	}),
```

Imperative polling (timers, loops, manual refetch calls) is for one-off operations such as a submitted request whose status you check. A hand-rolled refetch loop against cached data forks ownership of its error handling and forces shared mutable flags and mock seams. If its tests have to assert call forwarding, the architecture is wrong, not the tests.

### 6.4 Know what keeps a mutation pending

Awaiting a cache refresh inside a mutation's success callback keeps the mutation pending until fresh data arrives. That is fine when the button should stay loading; decide it on purpose (raised as an FYI).

### 6.5 Cancellation belongs to the operation that started it

```ts
// ❌ one handle shared by every run: stopping one run cancels all later ones too,
//    and replacing the handle on restart lets a stale run finish
let controller = new AbortController();
const start = () => { void loadDraft({ signal: controller.signal }); };
const stop = () => controller.abort();

// ✅ each run owns its cancellation
const start = () => {
	const controller = new AbortController();
	void loadDraft({ signal: controller.signal });
	return () => controller.abort();
};
```

Create the cancellation handle where the operation starts and cancel that handle in that operation's teardown — whatever the framework calls it (an effect cleanup, a destroy hook, a request's close event).

---

## 7. Files and ownership

### 7.1 One component per file; definitions beside it

A file defines one component — not even a small private second one. "We don't put components into one file; it is cleaner and lowers the tendency to start mixing code once it is already there."

When a component needs more than its inputs type, its folder grows siblings:

```
OrderPrimaryButton/
	OrderPrimaryButton.*         // the component: markup and wiring only
	types.ts                     // content and state types
	constants.ts                 // maps, test IDs, tracking params
	orderPrimaryButtonState.ts   // its state logic
```

"Components should have clean files; logic in helpers and utils; definitions in constants and types — depending on the amount." A small component with only an inputs type stays one file.

**Where it stops.** This is one team's convention, enforced in its reviews. Where your project keeps private single-use extractions beside their consumer, follow the project.

### 7.2 A generic pure function is a tested util

| The function… | Lives in | Test |
|---|---|---|
| is pure and any feature could use it (number parsing, date arithmetic, identifier validation) | the shared `utils` | Required |
| is pure but only this feature understands it (mapping this API to these rows) | the feature's `helpers/` | When it has real logic |
| is a few lines buried in a config object or callback (a custom validation rule, a polling-interval decision) | a named function next to it | When it has real logic |

Why: "A typical util, thrown in on the side." On a date helper: "I don't know how well the input is guarded — a test will verify it, and documentation of what goes in and out helps the next developer."

Choose by who can use it. Purity alone does not make code generic, and moving a feature mapping to `utils` to look generic — or keeping a generic function in `helpers/` to dodge a coverage rule — is the same mistake. Not every helper needs its own test file; trivial one-liners are covered through their callers.

### 7.3 Group code by purpose, not by screen

Extract a unit when several values exist only to produce one result the caller needs; name it for that result. Do not extract a unit that only collects unrelated callbacks: "For me this makes no sense, I don't see the added value. What bothers me is the grouping itself." Each callback sits next to the thing it feeds.

### 7.4 Reuse a near-identical component by moving it down

"Use the existing documents list — they look identical. Just move it lower, under the general components." When a component in another feature fits, move it to a shared location and use it from both. Do not copy it. Verify the two really share semantics and behavior first; similar markup alone is not enough (see [coding-principles.md](../principles/coding-principles.md#reuse-first-authoring)).

### 7.5 A messy file gets restructured, not annotated

"There is messy logic in this file, some ifs repeat — how about tidying it up?" When a reviewer calls a file hard to follow, the accepted fix splits it by responsibility (here, one content unit into a footer and a list), not a comment explaining it.

### 7.6 Pass the object once you pick more than two of its fields

```text
❌ orderDocuments( orderId, orderState, isOrderSecured )
✅ orderDocuments( order )
```

"My personal limit is that I pick out two, and then I pass the whole thing." One reviewer's threshold — a suggestion.

### 7.7 Frequently missed capabilities

Every row was flagged because a hand-rolled version was written instead. Your project's names will differ; the *needs* recur in most UI codebases. Build the equivalent table for your repository and check it before designing.

| Need | Typical hand-rolled version | What reviewers wanted |
|---|---|---|
| Join labels with a separator | `` `${label} *` ``, `` `${a}-${b}` `` | The project's join helper |
| Empty callback | `() => {}` | The shared `noop` |
| Two footer buttons | A column of buttons with manual gap | The multi-button component |
| Scrolling screen with footer buttons | Plain layout + footer element + scroll props | The scroll layout's buttons API |
| Form submit button | A button with `appearance = isValid ? …` | The form submit button component |
| Label and value in a row | A row with space-between alignment | The key/value row ("space-between won't stop them colliding with a bigger font on a narrow display") |
| Parse a number from a string | `Number(value)` | The project's number parser ("this can give you `NaN`") |
| Currency label | A hardcoded symbol in code or translations | The project's locale-aware currency-label helper |
| Disabled control | `if (disabled) return` in the handler | The component's own disabled input |
| Test IDs | A raw enum value or template string | The test-ID composing helpers |
| A static list of texts | One `t('…paragraph1')` call per paragraph | A translation array mapped in code (adding a paragraph then needs no code change) |
| A date format constant | A local `'dd.MM.yyyy'` | The project-wide setting ("don't we have one already?") |

On the static-list row: moving the keys into a code array does not solve the problem that was raised. Re-read the comment before resolving it.

---

## 8. Naming

Tier 3 unless the name misleads.

| Flagged | Accepted | Reason |
|---|---|---|
| `discount` for a value that may be absent | `maybeDiscount` | The value may be absent |
| `unavailable`, `total` for translated strings | `unavailableText`, `totalTitle` | "For `total` I expect a number" |
| `order`, `enums` for query results | `orderQuery`, `enumsQuery` | It is the query, not the data |
| `status` | `orderStatus` | "Status of what?" |
| `awaitConfirmation()` called without `await` | `startConfirmationPolling()` | "Or you forgot the await" |
| Two callbacks named `onSuccess` in one scope | `onSuccess` + `onConfirmed` | Confusing |
| `setOrderItem()` returning a new object | `composeOrderWithItem()` | "It is not really a setter" |
| `getIsValid()` / `get…` returning a boolean | `checkIsValid()`, `isValid` | `get` does not read as a question |
| `TRACKING_CATEGORY = Category.orders` | `Category.orders` directly | A const that only renames adds nothing |

Verbs: `compose…` builds a value, `get…` reads or derives one, `set…` mutates or stores, `check…`/`is…`/`has…` answer a question.

---

## 9. Comments

Reviewers flag verbose agent comments: "AI makes these comments needlessly long." Delete any comment that restates a name or a type; if deleting it makes the code unclear, rename instead.

A comment earns its place for:

- a non-obvious trade-off or counter-intuitive behavior (the *why*);
- a value or local union whose origin is not obvious — one line saying where it comes from;
- a patch to a dependency — why it exists;
- an intentionally generic or unusual component — its use case;
- a TODO or temporary hardcoded value — **with the ticket that removes it**.

Link a ticket, never a chat thread or a DM the team cannot open.

---

## 10. Product completeness

Reviewers treat these as part of the story, not follow-ups.

- **Translations.** Every new user-facing string exists in every supported locale with key parity. No placeholders survive to production. Unused keys are removed. Changing the text of an *existing* key goes through the translation-management system, not a code change.
- **Texts that quote an external rule** — legal limits, fee rates, regulatory deadlines, figures from an official form — live where they can change without an app release (for example a separately overridable translation namespace). "As soon as this changes, we would have to force-update the app for everyone." Move only those texts.
- **Feature flags.** A new API integration or entry point is unreachable without a flag. State every flag's default in every environment explicitly, and keep staging equal to production — someone flipping development to `true` must not silently ship it everywhere. If the only entry point is already behind the feature's flag, say so in the description.
- **Accessibility** ships with every story. **Tracking** is asked about for every new flow: "Does the business care how users move through it and where they get stuck? Ask the product owner." Record the answer.
- **States.** Loading, empty, error, retry, and partial data are handled.
- **Visual tests.** If the project relies on component snapshot tests, any visible UI change gets one with realistic fixture data. Measure the culture before writing a generic "avoid snapshots" rule — in the mined codebase reviewers *expected* them.
- **Access checks spell out the empty case.** `[].some(...)` is `false`, `[].every(...)` is `true`, and `[]` is truthy. In an authorization path, make the intended behavior for an empty role list explicit and test it — reviewers always probe it. Guard at the entry point (route, guard), not again down the tree, unless the component is reused outside that entry point; then write why.

---

## 11. Before review, and answering it

**Before requesting review**

1. Address the automated (AI or bot) review first. Reviewers asked for this on four merge requests in a row. Dismissing a finding is fine when you say why.
2. Run the team's checklist against your own diff.
3. For a stacked merge request, make sure the pipeline actually ran.
4. Exercise the screen: long lists, large fonts, narrow displays.

**Answering**

- Fix the problem that was raised, not a neighbouring one. "You did not solve the original problem" ended one round.
- When you disagree, give the reason. Reviewers accept reasons: a design confirmed by the designer, existing practice, a value that really is not unique.
- When the reviewer questions the approach itself, explain the goal, then try their shape. In case 5.5 the business rule survived; the mechanism changed.

---

## What is accepted — do not flag

None of the mined threads flags these. Flagging them costs a round trip.

- An explicit return type on a helper — and equally, its absence.
- `ReturnType<typeof createOrderForm>` as the type of a factory's result.
- A single-variable guard: `if (!params) return;`.
- A type-narrowing guard in a handler whose button is disabled in that state, when explained.
- A file layout that differs from the reviewer's taste when they marked it non-blocking.
- Two sibling fields without a gap ("probably doesn't matter").
- Named consts for every property read. Section 1 is about conditions and calculations; aliasing `const id = order.id` adds nothing and draws its own comment.
