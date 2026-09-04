'use strict';
module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow chained type assertions such as `value as unknown as Type`.' },
    schema: [],
    messages: { double: 'Double type assertion. Validate the value at its boundary (schema / type guard) or fix the source type instead of `as ... as`.' },
  },
  create(context) {
    const isAssertion = (n) => n && (n.type === 'TSAsExpression' || n.type === 'TSTypeAssertion');
    return {
      'TSAsExpression, TSTypeAssertion'(node) {
        if (isAssertion(node.expression)) context.report({ node, messageId: 'double' });
      },
    };
  },
};
