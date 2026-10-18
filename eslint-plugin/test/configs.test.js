'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const plugin = require('..');

const PREFIX = 'ai-agent-standards/';
const ruleNames = (rules) => Object.keys(rules).filter((name) => name.startsWith(PREFIX)).map((name) => name.slice(PREFIX.length));

test('every rule belongs to exactly one layer', () => {
  const layered = Object.values(plugin.ruleLayers).flatMap(ruleNames);
  assert.deepEqual([...layered].sort(), Object.keys(plugin.rules).sort());
  assert.equal(new Set(layered).size, layered.length);
});

test('the typescript presets carry only the core layer', () => {
  const core = ruleNames(plugin.ruleLayers.core).sort();
  assert.deepEqual(ruleNames(plugin.configs.typescript.rules).sort(), core);
  assert.deepEqual(ruleNames(plugin.configs['typescript-rules-only'].rules).sort(), core);
});

test('each framework preset carries the core plus its own layer only', () => {
  for (const [layer, rules] of Object.entries(plugin.ruleLayers)) {
    if (layer === 'core') continue;
    const expected = [...ruleNames(plugin.ruleLayers.core), ...ruleNames(rules)].sort();
    assert.deepEqual(ruleNames(plugin.configs[layer].rules).sort(), expected, layer);
    assert.deepEqual(ruleNames(plugin.configs[`${layer}-rules-only`].rules).sort(), expected, layer);
  }
});

test('0.1 aliases still resolve to the React presets', () => {
  assert.deepEqual(plugin.configs.recommended.rules, plugin.configs.react.rules);
  assert.deepEqual(plugin.configs['rules-only'].rules, plugin.configs['react-rules-only'].rules);
});
