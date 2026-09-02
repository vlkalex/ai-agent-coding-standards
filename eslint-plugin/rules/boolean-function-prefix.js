'use strict';
const COMPARISON = new Set(['===', '!==', '==', '!=', '<', '>', '<=', '>=', 'instanceof', 'in']);
const BOOLEAN_METHODS = new Set(['some', 'every', 'includes', 'startsWith', 'endsWith', 'has', 'isArray', 'hasOwnProperty']);
const PREDICATE_WORDS = 'Is|Has|Can|Should|Was|Will|Does|Did|Are|Have';

module.exports = {
  meta: {
    type: 'suggestion',
    docs: { description: 'A function that returns a boolean must not be named get*; use is/has/can/should/check so the call site reads as a predicate.' },
    schema: [{
      type: 'object',
      properties: { forbiddenPrefix: { type: 'string' }, suggestedPrefixes: { type: 'array', items: { type: 'string' } }, allowPredicateAfterPrefix: { type: 'boolean' } },
      additionalProperties: false,
    }],
    messages: { rename: '`{{name}}` returns a boolean but is named like a value getter. Rename it with a predicate prefix ({{prefixes}}), e.g. `{{suggestion}}`.' },
  },
  create(context) {
    const opts = context.options[0] || {};
    const forbidden = opts.forbiddenPrefix || 'get';
    const prefixes = opts.suggestedPrefixes || ['is', 'has', 'can', 'should', 'check'];
    const allowPredicate = opts.allowPredicateAfterPrefix ?? true; // getIsEnabled already reads as a predicate
    const forbiddenRe = new RegExp(`^${forbidden}[A-Z]`);
    const predicateRe = new RegExp(`^${forbidden}(${PREDICATE_WORDS})[A-Z]`);

    const isBooleanExpr = (n) => {
      if (!n) return false;
      switch (n.type) {
        case 'Literal': return typeof n.value === 'boolean';
        case 'BinaryExpression': return COMPARISON.has(n.operator);
        case 'UnaryExpression': return n.operator === '!';
        // `a === 1 && b` / `!a || b.c`: a comparison or negation on either side makes the whole expression read as a predicate
        case 'LogicalExpression': return (n.operator === '&&' || n.operator === '||') && (isBooleanExpr(n.left) || isBooleanExpr(n.right));
        case 'ConditionalExpression': return isBooleanExpr(n.consequent) && isBooleanExpr(n.alternate);
        case 'CallExpression': {
          const c = n.callee;
          return c.type === 'MemberExpression' && !c.computed && c.property.type === 'Identifier' && BOOLEAN_METHODS.has(c.property.name);
        }
        case 'TSAsExpression': case 'TSNonNullExpression': return isBooleanExpr(n.expression);
        default: return false;
      }
    };
    const returnsBoolean = (fn) => {
      if (fn.returnType && fn.returnType.typeAnnotation.type === 'TSBooleanKeyword') return true;
      if (fn.body.type !== 'BlockStatement') return isBooleanExpr(fn.body);
      const returns = [];
      const walk = (n) => {
        if (!n || typeof n.type !== 'string') return;
        if (n.type === 'ReturnStatement') { returns.push(n); return; }
        if (n !== fn && /Function/.test(n.type)) return; // don't descend into nested functions
        for (const key of context.sourceCode.visitorKeys[n.type] || []) {
          const child = n[key];
          if (Array.isArray(child)) child.forEach(walk); else if (child) walk(child);
        }
      };
      walk(fn.body);
      return returns.length > 0 && returns.every((r) => isBooleanExpr(r.argument));
    };
    const check = (fn, name, nameNode) => {
      if (!name || !forbiddenRe.test(name) || (allowPredicate && predicateRe.test(name)) || !returnsBoolean(fn)) return;
      const suggestion = 'is' + name.slice(forbidden.length);
      context.report({ node: nameNode, messageId: 'rename', data: { name, prefixes: prefixes.join('/'), suggestion } });
    };
    return {
      FunctionDeclaration(n) { if (n.id) check(n, n.id.name, n.id); },
      VariableDeclarator(n) {
        if (n.id.type === 'Identifier' && n.init && (n.init.type === 'ArrowFunctionExpression' || n.init.type === 'FunctionExpression')) check(n.init, n.id.name, n.id);
      },
    };
  },
};
