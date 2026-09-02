'use strict';
module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'Files matching a pattern must call given functions (e.g. every *Screen.tsx must call useSendAnalyticsOnMount). Mechanizes "every story ships with tracking".' },
    schema: [{
      type: 'array',
      items: {
        type: 'object',
        properties: {
          files: { type: 'string' },
          ignore: { type: 'string' },
          calls: { type: 'array', items: { type: 'string' }, minItems: 1 },
          message: { type: 'string' },
        },
        required: ['files', 'calls'],
        additionalProperties: false,
      },
    }],
    messages: { missing: 'Files matching /{{files}}/ must call `{{call}}`. {{message}}' },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    const configs = (context.options[0] || []).filter((c) => new RegExp(c.files).test(filename) && !(c.ignore && new RegExp(c.ignore).test(filename)));
    if (configs.length === 0) return {};
    const seen = new Set();
    return {
      CallExpression(n) {
        const c = n.callee;
        if (c.type === 'Identifier') seen.add(c.name);
        else if (c.type === 'MemberExpression' && !c.computed && c.property.type === 'Identifier') seen.add(c.property.name);
      },
      'Program:exit'(node) {
        for (const cfg of configs) for (const call of cfg.calls) {
          if (!seen.has(call)) context.report({ node, loc: { line: 1, column: 0 }, messageId: 'missing', data: { files: cfg.files, call, message: cfg.message || '' } });
        }
      },
    };
  },
};
