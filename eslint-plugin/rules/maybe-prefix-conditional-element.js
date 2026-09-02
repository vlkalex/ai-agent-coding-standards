'use strict';
const isJsx = (n) => n && (n.type === 'JSXElement' || n.type === 'JSXFragment');
const isNullish = (n) => n && ((n.type === 'Literal' && n.value === null) || (n.type === 'Identifier' && n.name === 'undefined'));

module.exports = {
  meta: {
    type: 'suggestion',
    docs: { description: 'A const holding a conditionally rendered element is named maybe* so readers know it can be null.' },
    schema: [{ type: 'object', properties: { prefix: { type: 'string' } }, additionalProperties: false }],
    messages: { rename: '`{{name}}` holds a conditionally rendered element. Name it `{{suggestion}}` so the null case is visible at every use.' },
  },
  create(context) {
    const prefix = (context.options[0] || {}).prefix || 'maybe';
    const isConditionalElement = (init) => {
      if (!init) return false;
      if (init.type === 'ConditionalExpression') return (isJsx(init.consequent) && isNullish(init.alternate)) || (isJsx(init.alternate) && isNullish(init.consequent));
      if (init.type === 'LogicalExpression' && init.operator === '&&') return isJsx(init.right);
      return false;
    };
    return {
      VariableDeclarator(n) {
        if (n.id.type !== 'Identifier' || !isConditionalElement(n.init)) return;
        const name = n.id.name;
        if (name.startsWith(prefix)) return;
        const suggestion = prefix + name[0].toUpperCase() + name.slice(1);
        context.report({ node: n.id, messageId: 'rename', data: { name, suggestion } });
      },
    };
  },
};
