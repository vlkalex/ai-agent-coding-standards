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
};

const plugin = { meta: { name: 'eslint-plugin-ai-agent-standards', version: '0.1.0' }, rules, configs: {} };

/** Only this plugin's rules — for projects that already configure TypeScript parsing themselves. */
const customRules = {
  'ai-agent-standards/named-condition': 'error',
  'ai-agent-standards/named-hook-deps': 'error',
  'ai-agent-standards/no-double-type-assertion': 'error',
  'ai-agent-standards/no-tsx-without-jsx': 'warn', // correct but usually a large legacy backlog; promote to error once clean
  'ai-agent-standards/no-inline-noop': 'error',
  'ai-agent-standards/no-repeated-jsx-literal-prop': 'warn',
  'ai-agent-standards/no-verbose-comments': 'warn',
  'ai-agent-standards/one-component-per-file': 'error',
  'ai-agent-standards/no-banned-identifiers': 'off', // opt in with a project-specific map
  'ai-agent-standards/prefer-named-types': 'warn',
  'ai-agent-standards/boolean-function-prefix': 'error',
  'ai-agent-standards/maybe-prefix-conditional-element': 'off', // one reviewer's convention; opt in per project
  'ai-agent-standards/require-call-in-file': 'off', // opt in with project patterns (e.g. every *Screen.tsx calls the analytics hook)
  'ai-agent-standards/no-optional-boolean': 'off', // opt in: a Tier-3 preference
};

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

plugin.configs['rules-only'] = {
  name: 'ai-agent-standards/rules-only',
  plugins: { 'ai-agent-standards': plugin },
  rules: customRules,
};

plugin.configs.recommended = {
  name: 'ai-agent-standards/recommended',
  files: ['**/*.{ts,tsx,js,jsx,mts,cts}'],
  plugins: { 'ai-agent-standards': plugin, '@typescript-eslint': tsPlugin },
  languageOptions: { parser: tsParser, parserOptions: { ecmaFeatures: { jsx: true } } },
  rules: { ...customRules, ...stockRules },
};

module.exports = plugin;
