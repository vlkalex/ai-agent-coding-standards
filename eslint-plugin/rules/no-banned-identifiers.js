'use strict';
module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'Ban specific identifiers (de-facto deprecated helpers) with a per-identifier replacement message. Encodes tribal "měl jsem dát deprecated" knowledge as a rule.' },
    schema: [{
      type: 'object',
      additionalProperties: { type: 'string' },
    }],
    messages: { banned: '`{{name}}` is banned here: {{reason}}' },
  },
  create(context) {
    const banned = context.options[0] || {};
    const names = new Set(Object.keys(banned));
    if (names.size === 0) return {};
    const report = (node, name) => context.report({ node, messageId: 'banned', data: { name, reason: banned[name] } });
    return {
      ImportSpecifier(node) { if (names.has(node.imported.name)) report(node, node.imported.name); },
      ImportDefaultSpecifier(node) { if (names.has(node.local.name)) report(node, node.local.name); },
      CallExpression(node) {
        const c = node.callee;
        if (c.type === 'Identifier' && names.has(c.name)) report(c, c.name);
        if (c.type === 'MemberExpression' && !c.computed && c.property.type === 'Identifier' && names.has(c.property.name)) report(c.property, c.property.name);
      },
    };
  },
};
