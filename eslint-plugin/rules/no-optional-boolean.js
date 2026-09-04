'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Avoid `boolean | undefined` / `flag?: boolean`; make booleans required (or defaulted) unless optionality is genuinely distributed.' },
    schema: [],
    messages: { optional: 'Optional boolean. Make `{{name}}` required or give it a default; three-state booleans ("Pročpak undefined?") leak into every consumer.' },
  },
  create(context) {
    const src = context.sourceCode;
    const isBool = (t) => t && t.type === 'TSBooleanKeyword';
    const nameOf = (n) => (n.key ? src.getText(n.key) : n.name ? src.getText(n.name) : n.type === 'Identifier' ? n.name : 'this value');
    return {
      TSPropertySignature(n) {
        if (n.optional && n.typeAnnotation && isBool(n.typeAnnotation.typeAnnotation)) context.report({ node: n, messageId: 'optional', data: { name: nameOf(n) } });
      },
      TSUnionType(n) {
        const hasBool = n.types.some(isBool);
        const hasUndef = n.types.some((t) => t.type === 'TSUndefinedKeyword');
        if (hasBool && hasUndef) context.report({ node: n, messageId: 'optional', data: { name: 'this value' } });
      },
      Identifier(n) {
        if (n.optional && n.typeAnnotation && isBool(n.typeAnnotation.typeAnnotation) && n.parent && /Function/.test(n.parent.type)) {
          context.report({ node: n, messageId: 'optional', data: { name: n.name } });
        }
      },
    };
  },
};
