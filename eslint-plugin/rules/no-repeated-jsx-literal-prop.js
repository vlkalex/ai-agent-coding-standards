'use strict';
const DEFAULT_IGNORE = ['key', 'id', 'testID', 'testId', 'accessibilityLabel', 'accessibilityHint', 'name', 'type', 'href', 'src'];

module.exports = {
  meta: {
    type: 'suggestion',
    docs: { description: 'The same literal prop value repeated on the same element type N+ times in one file should be a shared const (or a wrapping component).' },
    schema: [{
      type: 'object',
      properties: {
        min: { type: 'integer', minimum: 2 },
        ignoreProps: { type: 'array', items: { type: 'string' } },
        perElement: { type: 'boolean' },
      },
      additionalProperties: false,
    }],
    messages: { repeated: '`{{prop}}={{value}}` appears {{count}} times on `<{{element}}>` in this file. Put the value in a shared const, or wrap `<{{element}}>` in a component that fixes it.' },
  },
  create(context) {
    const opts = context.options[0] || {};
    const min = opts.min ?? 3;
    const ignore = new Set(opts.ignoreProps || DEFAULT_IGNORE);
    const perElement = opts.perElement ?? true;
    const src = context.sourceCode;
    const seen = new Map();

    const literalText = (v) => {
      if (!v) return null;
      if (v.type === 'Literal') return src.getText(v);
      if (v.type === 'JSXExpressionContainer' && v.expression.type === 'Literal') return src.getText(v.expression);
      return null;
    };
    const elementName = (attr) => {
      const n = attr.parent && attr.parent.name;
      return n ? src.getText(n) : '?';
    };

    return {
      JSXAttribute(node) {
        if (node.name.type !== 'JSXIdentifier' || ignore.has(node.name.name)) return;
        const value = literalText(node.value);
        if (value === null) return;
        const element = elementName(node);
        const key = `${perElement ? element : '*'}|${node.name.name}|${value}`;
        const entry = seen.get(key) || { count: 0, first: node, element, prop: node.name.name, value };
        entry.count += 1;
        seen.set(key, entry);
      },
      'Program:exit'() {
        for (const e of seen.values()) {
          if (e.count >= min) {
            context.report({ node: e.first, messageId: 'repeated', data: { prop: e.prop, value: e.value, count: e.count, element: e.element } });
          }
        }
      },
    };
  },
};
