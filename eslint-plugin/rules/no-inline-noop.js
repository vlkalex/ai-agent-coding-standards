'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Disallow inline empty functions (`() => {}`) passed as arguments, props, or object values; use the shared noop helper.' },
    schema: [{
      type: 'object',
      properties: { noopName: { type: 'string' }, importSource: { type: 'string' } },
      additionalProperties: false,
    }],
    messages: { useShared: 'Inline no-op function. Import the shared `{{noopName}}`{{from}} instead of defining a new empty function.' },
  },
  create(context) {
    const opts = context.options[0] || {};
    const noopName = opts.noopName || 'noop';
    const from = opts.importSource ? ` from \`${opts.importSource}\`` : '';
    const isEmptyFn = (n) =>
      (n.type === 'ArrowFunctionExpression' || n.type === 'FunctionExpression') &&
      n.params.length === 0 && n.body.type === 'BlockStatement' && n.body.body.length === 0;
    const inValuePosition = (n) => {
      const p = n.parent;
      return p && (
        p.type === 'JSXExpressionContainer' ||
        (p.type === 'CallExpression' && p.arguments.includes(n)) ||
        (p.type === 'Property' && p.value === n) ||
        p.type === 'ArrayExpression' ||
        (p.type === 'AssignmentPattern' && p.right === n) ||
        (p.type === 'VariableDeclarator' && p.init === n && !(p.id.type === 'Identifier' && p.id.name === noopName))
      );
    };
    return {
      'ArrowFunctionExpression, FunctionExpression'(node) {
        if (isEmptyFn(node) && inValuePosition(node)) {
          context.report({ node, messageId: 'useShared', data: { noopName, from } });
        }
      },
    };
  },
};
