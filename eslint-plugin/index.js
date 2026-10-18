'use strict';
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

const rules = {
  'named-condition': require('./rules/named-condition'),
  'named-hook-deps': require('./rules/named-hook-deps'),
  'no-double-type-assertion': require('./rules/no-double-type-assertion'),
  'no-tsx-without-jsx': require('./rules/no-tsx-without-jsx'),
  'no-inline-noop': require('./rules/no-inline-noop'),
  'no-repeated-jsx-literal-prop': require('./rules/no-repeated-jsx-literal-prop'),
  'no-verbose-comments': require('./rules/no-verbose-comments'),
  'one-component-per-file': require('./rules/one-component-per-file'),
  'no-banned-identifiers': require('./rules/no-banned-identifiers'),
  'prefer-named-types': require('./rules/prefer-named-types'),
  'boolean-function-prefix': require('./rules/boolean-function-prefix'),
  'maybe-prefix-conditional-element': require('./rules/maybe-prefix-conditional-element'),
  'require-call-in-file': require('./rules/require-call-in-file'),
  'no-optional-boolean': require('./rules/no-optional-boolean'),
  'todo-requires-ticket': require('./rules/todo-requires-ticket'),
  'no-element-map-in-render': require('./rules/no-element-map-in-render'),
};

const plugin = { meta: { name: 'eslint-plugin-ai-agent-standards', version: '0.2.0' }, rules, configs: {} };

/** Rules that apply to any TypeScript or JavaScript code. */
const coreRules = {
  'ai-agent-standards/named-condition': 'error',
  'ai-agent-standards/no-double-type-assertion': 'error',
  'ai-agent-standards/no-inline-noop': 'error',
  'ai-agent-standards/no-verbose-comments': 'warn',
  'ai-agent-standards/no-banned-identifiers': 'off', // opt in with a project-specific map
  'ai-agent-standards/prefer-named-types': 'warn',
  'ai-agent-standards/boolean-function-prefix': 'error',
  'ai-agent-standards/require-call-in-file': 'off', // opt in with project patterns (e.g. every *Screen.tsx calls the analytics hook)
  'ai-agent-standards/no-optional-boolean': 'off', // opt in: a Tier-3 preference
  'ai-agent-standards/todo-requires-ticket': 'warn',
};

/** Rules about JSX, hooks, and component files: the React layer. */
const reactRules = {
  'ai-agent-standards/named-hook-deps': 'error',
  'ai-agent-standards/no-tsx-without-jsx': 'warn', // correct but usually a large legacy backlog; promote to error once clean
  'ai-agent-standards/no-repeated-jsx-literal-prop': 'warn',
  'ai-agent-standards/one-component-per-file': 'error',
  'ai-agent-standards/maybe-prefix-conditional-element': 'off', // one reviewer's convention; opt in per project
  'ai-agent-standards/no-element-map-in-render': 'error',
};

/** Each framework layer's rules, beside the core. A new framework adds an entry here and a preset below. */
const ruleLayers = { core: coreRules, react: reactRules };

/** Stock rules that cover the remaining mechanical review comments. */
const stockRules = {
  'no-nested-ternary': 'error',
  'complexity': ['warn', 12],
  'max-lines': ['warn', { max: 250, skipBlankLines: true, skipComments: true }],
  'max-lines-per-function': ['warn', { max: 120, skipBlankLines: true, skipComments: true, IIFEs: true }],
  'no-restricted-syntax': ['error', {
    selector: 'TSAsExpression > TSTypeReference > Identifier[name="any"]',
    message: 'Casting to any hides the real type. Fix the type at its boundary.',
  }],
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-non-null-assertion': 'error',
  '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
  '@typescript-eslint/no-unnecessary-type-assertion': 'off', // needs type info; enable in projects with parserOptions.project
};

const parserOptionsFor = (hasJsx) => (hasJsx ? { parserOptions: { ecmaFeatures: { jsx: true } } } : {});

const preset = ({ name, layerRules, hasJsx }) => ({
  name: `ai-agent-standards/${name}`,
  files: hasJsx ? ['**/*.{ts,tsx,js,jsx,mts,cts}'] : ['**/*.{ts,js,mts,cts}'],
  plugins: { 'ai-agent-standards': plugin, '@typescript-eslint': tsPlugin },
  languageOptions: { parser: tsParser, ...parserOptionsFor(hasJsx) },
  rules: { ...coreRules, ...layerRules, ...stockRules },
});

const rulesOnly = (name, layerRules) => ({
  name: `ai-agent-standards/${name}`,
  plugins: { 'ai-agent-standards': plugin },
  rules: { ...coreRules, ...layerRules },
});

/** Any TypeScript project (Angular, Vue, Node, …): core rules only. */
plugin.configs.typescript = preset({ name: 'typescript', layerRules: {}, hasJsx: false });
plugin.configs['typescript-rules-only'] = rulesOnly('typescript-rules-only', {});

/** React projects, including Next.js and React Native: core plus the React layer. */
plugin.configs.react = preset({ name: 'react', layerRules: reactRules, hasJsx: true });
plugin.configs['react-rules-only'] = rulesOnly('react-rules-only', reactRules);

/** Aliases kept for 0.1 configs: `recommended` and `rules-only` are the React presets. */
plugin.configs.recommended = { ...plugin.configs.react, name: 'ai-agent-standards/recommended' };
plugin.configs['rules-only'] = { ...plugin.configs['react-rules-only'], name: 'ai-agent-standards/rules-only' };

plugin.ruleLayers = ruleLayers;

module.exports = plugin;
