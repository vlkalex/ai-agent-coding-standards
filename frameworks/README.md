# Framework Layers

The standards come in two layers:

- **Core** — `principles/`, `review/`, `workflow/`, `agents/`, and the core skills. Framework-neutral TypeScript: naming, typing, backend contracts, errors, file ownership, UI layout and routing principles, product completeness, review, and reuse. Always installed, always applies.
- **Framework layers** — one folder per framework under `frameworks/`, each packaged as a skill. A layer holds what only makes sense in that framework: its syntax, its lifecycle, its failure modes. An agent loads a layer only when the code it touches uses that framework, so an agent working in Angular never reads React guidance.

| Layer | Skill | Covers |
|---|---|---|
| [react](./react/SKILL.md) | `react-standards` | Components, hooks, effects, JSX, render behavior — React web, Next.js, Remix, React Native |

## Core or layer?

Put a case in the core when its rule holds without the framework's syntax. Put it in a layer when the rule, the reason, or the failure only exists in that framework.

- *A multi-part condition gets a name* — core. In React it also shrinks an effect's dependency array; that example goes in the React layer as an extension of the core case.
- *Never create a component during render* — React layer: the remount only exists in React's render model.
- *The submit control owns the form state it shows* — core principle; the re-render cost behind it is React's, so the concrete case lives in the React layer.

When a layer case extends a core case, its index names the core case. The core never links to a layer.

## Anatomy of a layer

```
frameworks/<framework>/
	SKILL.md                 # name: <framework>-standards; description names the framework and its meta-frameworks
	casebook.md              # framework cases: tiers, the core case each extends, do-not-flag list
	<guidelines>.md          # optional authoring guidance
	agents/openai.yaml       # display metadata for Agent Skills-compatible tools
```

## Adding a framework

1. Create the folder above. Start the casebook from your own reviewers' comments ([mining-review-feedback.md](../workflow/mining-review-feedback.md)), not from translated React cases.
2. Write the skill description so it triggers on the framework's name and its meta-frameworks (for example "Angular" and "Analog", or "Vue" and "Nuxt"), and on nothing else.
3. Register the layer in `bin/init.js`: its files, and the `package.json` dependencies that detect it.
4. Add a row to the table above and an install test in `test/init.test.js`.
5. If it needs lint rules, add them to the plugin as a new entry in `ruleLayers` with `configs.<framework>` and `configs['<framework>-rules-only']` presets. The configs test then checks the layer stays separate from the core and from other frameworks.
