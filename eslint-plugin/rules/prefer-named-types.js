'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Inline object type literals with several members belong in a named type ("vytáhnul bych do separátních typů").' },
    schema: [{ type: 'object', properties: { minMembers: { type: 'integer', minimum: 1 } }, additionalProperties: false }],
    messages: { extract: 'Inline object type with {{count}} members. Extract it to a named type (e.g. in types.ts) so its intent is visible and reusable.' },
  },
  create(context) {
    const min = (context.options[0] || {}).minMembers ?? 3;
    const insideNamedType = (n) => {
      for (let p = n.parent; p; p = p.parent) {
        if (p.type === 'TSTypeAliasDeclaration' || p.type === 'TSInterfaceDeclaration') return true;
      }
      return false;
    };
    return {
      TSTypeLiteral(node) {
        if (node.members.length < min || insideNamedType(node)) return;
        context.report({ node, messageId: 'extract', data: { count: node.members.length } });
      },
    };
  },
};
