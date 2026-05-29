# React Native + TypeScript Component Guidelines

Rules for writing reusable, composable, maintainable UI code. AI agents MUST follow these before writing any component.

## The Core Problem

AI agents tend to create monolithic screen files with complex logic and inline UI. This produces:
- Components that can't be reused across screens
- Business logic mixed with presentation
- Duplicate UI patterns across the codebase
- Files that grow to 300+ lines and become hard to maintain

## Pre-Implementation Checklist

Before creating ANY new component or screen, the agent MUST:

1. **Check the project's UI library first** — does the primitive already exist in the component library? (e.g., HeroUI Native, Radix UI, Shadcn, etc.) Check `package.json` for installed UI libraries if unsure.
2. **Search existing components** — `ls components/ui/`, `ls components/common/`, `ls components/` for domain folders
3. **Search existing hooks** — `ls hooks/` for data-fetching or logic hooks that already exist
4. **Search existing helpers** — `ls helpers/` for utility functions
5. **Only then** create new code — and only for what doesn't exist yet

## Architecture Layers

```
┌─────────────────────────────────────────────┐
│  app/ screens        Routing + composition  │
│  (thin, no logic)    Compose from hooks +   │
│                      components             │
├─────────────────────────────────────────────┤
│  hooks/              Stateful logic         │
│  use-*.ts            Data fetching, state,  │
│                      side effects           │
├─────────────────────────────────────────────┤
│  components/ui/      Generic reusable UI    │
│                      (no business logic)    │
├─────────────────────────────────────────────┤
│  components/common/  Shared domain UI       │
│                      (cross-feature)        │
├─────────────────────────────────────────────┤
│  components/{domain} Feature-specific UI    │
│                      (portfolio/, trade/)   │
├─────────────────────────────────────────────┤
│  helpers/            Pure functions          │
│                      (no React imports)     │
├─────────────────────────────────────────────┤
│  lib/store/          Zustand stores         │
│  generated/          GraphQL codegen        │
└─────────────────────────────────────────────┘
```

## Rules

### 1. Screens are Composers, Not Builders

Screen files in `app/` should ONLY:
- Call hooks for data and logic
- Compose components into a layout
- Handle navigation

Screen files should NEVER:
- Contain UI primitives directly (no raw `<View>` + `<Text>` layouts beyond basic wrappers)
- Contain business logic
- Exceed ~100 lines

```tsx
// GOOD — screen composes from existing pieces
export default function PortfolioScreen() {
  const { portfolio, isLoading } = usePortfolio();
  const { currency } = useSettingsStore();

  if (isLoading) return <LoadingSpinner />;

  return (
    <PageWrapper>
      <PortfolioSummaryCard portfolio={portfolio} currency={currency} />
      <HoldingsList items={portfolio.items} />
    </PageWrapper>
  );
}

// BAD — screen builds everything inline
export default function PortfolioScreen() {
  const [data, setData] = useState(null);
  useEffect(() => { /* fetch logic */ }, []);
  const total = data?.items.reduce((sum, i) => sum + i.value, 0);
  // ... 200 more lines of logic and UI
  return (
    <View>
      <View className="flex-row justify-between p-4">
        <Text className="text-lg font-bold">Portfolio</Text>
        <Text className="text-success">{formatCurrency(total)}</Text>
      </View>
      {/* ... 100 more lines of inline UI */}
    </View>
  );
}
```

### 2. Extract Before You Build

When you need a piece of UI, ask in this order:

1. **Does `components/ui/` have it?** → Use it (AppCard, SectionLabel, ListItemCard, QuantityStepper, etc.)
2. **Does `components/common/` have it?** → Use it (PageHeader, MenuGroup, FilterSheet, etc.)
3. **Does the domain folder have it?** → Use it (`components/portfolio/`, `components/trade/`, etc.)
4. **Is it generic enough for `ui/`?** → Create it there (will be used by 2+ features)
5. **Is it shared across features?** → Create in `common/`
6. **Is it feature-specific?** → Create in `components/{domain}/`

### 3. Component Size Limits

| Location | Max lines | If exceeded |
|----------|-----------|-------------|
| `app/` screen | ~100 | Extract components |
| `components/ui/` | ~80 | Split into sub-components |
| `components/{domain}/` | ~150 | Extract reusable parts to `ui/` or `common/` |
| `hooks/` | ~100 | Split into focused hooks |
| `helpers/` | ~50 per function | Split file into folder |

These aren't hard limits — use judgment. But if a file is growing past these, it's a signal to decompose.

### 4. Component Contract

Every component follows this pattern:

```tsx
// Props type — always suffixed with "Props"
interface PortfolioSummaryCardProps {
  totalValue: number;
  totalCost: number;
  currency: string;
  onPress?: () => void;
}

// Component — receives data, renders UI, no fetching
export function PortfolioSummaryCard({
  totalValue,
  totalCost,
  currency,
  onPress,
}: PortfolioSummaryCardProps) {
  const pnl = totalValue - totalCost;
  const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;

  return (
    <AppCard onPress={onPress}>
      <SectionLabel>PORTFOLIO SUMMARY</SectionLabel>
      <StatRow label="Total Value" value={formatCurrency(totalValue, currency)} />
      <StatRow label="Total Cost" value={formatCurrency(totalCost, currency)} />
      <StatRow
        label="P&L"
        value={formatPnl(pnl, pnlPercent, currency)}
        valueClassName={pnl >= 0 ? 'text-success' : 'text-danger'}
      />
    </AppCard>
  );
}
```

Rules:
- Props type is always exported and named `{ComponentName}Props`
- No default exports for components (only screens use default export)
- No data fetching inside components — receive via props
- Formatting logic (currency, dates, percentages) goes in `helpers/`
- Simple derived values (like P&L calculation above) are fine inside the component

### 5. Hook Contract

```tsx
// One hook per concern — not one mega-hook per screen
export function usePortfolioStats(portfolioId: string, currency: Currency) {
  const { data, isLoading, error } = useMyPortfolioQuery({ currency });

  const stats = useMemo(() => {
    if (!data?.myPortfolio) return null;
    return calculatePortfolioStats(data.myPortfolio, currency);
  }, [data, currency]);

  return { stats, isLoading, error };
}
```

Rules:
- Hooks own data fetching, mutations, and side effects
- Name: `use{Feature}.ts` or `use-{feature}.ts` (match existing convention)
- Return an object with named properties (not positional array)
- Expensive computations wrapped in `useMemo`
- Callbacks wrapped in `useCallback`
- Don't return raw query objects — transform into what the consumer needs

### 6. Helper Contract

```tsx
// helpers/portfolio.ts — pure functions, no React
export function calculatePnl(totalValue: number, totalCost: number): { amount: number; percent: number } {
  const amount = totalValue - totalCost;
  const percent = totalCost > 0 ? (amount / totalCost) * 100 : 0;
  return { amount, percent };
}

export function formatCurrency(value: number, currency: string): string {
  return `${currency === 'EUR' ? '€' : '$'}${value.toFixed(2)}`;
}
```

Rules:
- No React imports
- No side effects
- Pure input → output
- Export individual functions (not classes)
- Group by domain: `helpers/portfolio.ts`, `helpers/price-utils.ts`, etc.

### 7. Reusable UI Components We Already Have

Before building, check these exist in `components/ui/`:

| Component | What it does | When to use |
|-----------|-------------|-------------|
| `AppCard` | Rounded card container | Any grouped content section |
| `SectionLabel` | Uppercase tiny label | Section headings inside cards |
| `ListItemCard` | Row with image, text, price | Any list item (holdings, sold items, search results) |
| `LargePriceInput` | Big centered number input | Price entry screens |
| `QuantityStepper` | [-] N [+] control | Quantity selection |
| `Chip` | Rounded pill | Filters, tags, selectors |
| `IconButton` | Icon-only button | Toolbar actions |
| `DataTable` | Key-value rows | Stats, details display |
| `Divider` | Horizontal line | Section separators |
| `PriceChangeText` | Colored +/- text | P&L display |
| `AnimatedNumberDisplay` | Animated counter | Value transitions |
| `ErrorFallback` | Error state UI | Error boundaries |
| `ErrorView` | Full-screen error | Fatal errors |

And in `components/common/`:

| Component | What it does |
|-----------|-------------|
| `PageHeader` | Screen header with title/actions |
| `PageWrapper` | Safe area + scroll wrapper |
| `MenuGroup` / `MenuItem` | Settings-style grouped rows |
| `FilterSheet` | Bottom sheet with filter options |
| `DatePickerSheet` | Date selection bottom sheet |
| `ListItemCard` | Flexible list row |
| `SearchFilterBar` | Search input + filter button |

### 8. When to Create a New Reusable Component

Create a new `ui/` component when:
- The same visual pattern appears in 2+ places (or will clearly be needed again)
- It's purely presentational (no business logic)
- It can be described in one sentence ("A stat row with label and value")

Create a new `common/` component when:
- It combines multiple `ui/` components into a pattern used across features
- It has light domain awareness but isn't tied to one feature

DO NOT create a reusable component when:
- It's used exactly once and has no clear reuse path
- It's tightly coupled to one screen's specific logic
- You'd need to pass 10+ props to make it "generic" — that's a sign it should stay specific

### 9. File Organization for New Features

When adding a new feature (e.g., "sold items management"):

```
components/
  portfolio/
    sold-items-list.tsx          # Feature-specific component
    sold-item-row.tsx            # Feature-specific component
    edit-sale-form.tsx           # Feature-specific component
    revert-sale-sheet.tsx        # Feature-specific component

hooks/
  use-sold-items.ts              # Data fetching for sold items
  use-edit-sale.ts               # Edit sale mutation + logic

helpers/
  portfolio.ts                   # Add pure functions here (not new file unless >50 functions)

app/(protected)/(app)/portfolio/
  sold.tsx                       # Screen — composes from above
```

NOT:
```
app/(protected)/(app)/portfolio/
  sold.tsx                       # 400-line file with everything inline
```

### 10. Composition Over Configuration

Prefer composing small components over one configurable mega-component:

```tsx
// GOOD — compose
<AppCard>
  <SectionLabel>SALE SUMMARY</SectionLabel>
  <StatRow label="Revenue" value="€2,450" />
  <StatRow label="Profit" value="+€890" valueClassName="text-success" />
</AppCard>

// BAD — configure
<StatsCard
  title="SALE SUMMARY"
  stats={[
    { label: "Revenue", value: "€2,450" },
    { label: "Profit", value: "+€890", color: "success" },
  ]}
  variant="bordered"
  showDividers
  compact
/>
```

The composed version is easier to read, modify, and extend. The configured version creates an abstraction that hides what's actually rendered.

### 11. Testing

Not everything needs a test. But some things always do.

**Always test:**
- `helpers/` functions — these are pure logic, easy to test, high value. Every helper file should have a corresponding `__tests__/{name}.test.ts`.
- Utility functions in `lib/` — same logic: pure input → output, always testable.
- Complex hooks with business logic — if a hook transforms data, calculates values, or has branching logic, test the logic (extract to a helper if needed to make it testable).
- Bug fixes — when fixing a bug, write a test that reproduces it first, then fix. Prevents regressions.

**Don't test (unless asked):**
- Simple presentational components — if a component just renders props into JSX with no logic, a test adds no value.
- Direct wrappers around library components — testing that HeroUI's Button renders is testing their code, not yours.
- One-line hooks — `useMyQuery` that just calls a generated GraphQL hook doesn't need a test.

**Test file location:**
```
helpers/
  __tests__/
    portfolio.test.ts      # Tests for helpers/portfolio.ts
    price-utils.test.ts    # Tests for helpers/price-utils.ts
lib/utils/
  __tests__/
    price.test.ts          # Tests for lib/utils/price.ts
```

**Test structure:**
```tsx
import { calculatePnl, formatCurrency } from '../portfolio';

describe('calculatePnl', () => {
  it('returns positive P&L when value exceeds cost', () => {
    const result = calculatePnl(150, 100);
    expect(result.amount).toBe(50);
    expect(result.percent).toBe(50);
  });

  it('returns zero percent when cost is zero', () => {
    const result = calculatePnl(100, 0);
    expect(result.percent).toBe(0);
  });
});
```

**Rule for agents:** When creating a new helper file, always create the corresponding test file in `__tests__/`. When modifying an existing helper, check if tests exist — if yes, update them; if no, add them for the functions you touched.
