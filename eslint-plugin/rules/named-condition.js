'use strict';
const LOGICAL = new Set(['&&', '||', '??']);

module.exports = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Require compound conditions to be extracted into named booleans ("Do proměnné").' },
    schema: [{
      type: 'object',
      properties: {
        maxLogicalOperators: { type: 'integer', minimum: 0 },
        allowComparisonOperands: { type: 'boolean' },
      },
      additionalProperties: false,
    }],
    messages: {
      tooManyOperators: 'Condition has {{count}} logical operators (max {{max}}). Extract it into a named boolean, e.g. `const isReady = ...`.',
      unnamedOperand: 'Compound condition mixes an inline expression with logical operators. Name each operand first, e.g. `const isDraft = state === DRAFT`.',
    },
  },
  create(context) {
    const opts = context.options[0] || {};
    const max = opts.maxLogicalOperators ?? 1;
    const allowComparison = opts.allowComparisonOperands ?? false;

    const isNamed = (n) => {
      switch (n.type) {
        case 'Identifier': case 'ThisExpression': case 'Literal': case 'MemberExpression': case 'ChainExpression':
          return true;
        case 'UnaryExpression': return n.operator === '!' && isNamed(n.argument);
        case 'TSNonNullExpression': case 'TSAsExpression': case 'TSSatisfiesExpression':
          return isNamed(n.expression);
        case 'BinaryExpression': return allowComparison;
        default: return false;
      }
    };

    const analyze = (n, acc) => {
      if (n.type === 'LogicalExpression' && LOGICAL.has(n.operator)) {
        acc.ops += 1; analyze(n.left, acc); analyze(n.right, acc); return;
      }
      if (n.type === 'UnaryExpression' && n.operator === '!') { analyze(n.argument, acc); return; }
      if (!isNamed(n)) acc.unnamed += 1;
    };

    const check = (test) => {
      if (!test || test.type !== 'LogicalExpression') return;
      const acc = { ops: 0, unnamed: 0 };
      analyze(test, acc);
      if (acc.ops > max) {
        context.report({ node: test, messageId: 'tooManyOperators', data: { count: acc.ops, max } });
      } else if (acc.unnamed > 0) {
        context.report({ node: test, messageId: 'unnamedOperand' });
      }
    };

    return {
      IfStatement: (n) => check(n.test),
      ConditionalExpression: (n) => check(n.test),
      WhileStatement: (n) => check(n.test),
      DoWhileStatement: (n) => check(n.test),
      ForStatement: (n) => check(n.test),
      // {cond && <Jsx/>} — the guard is everything left of the JSX
      JSXExpressionContainer: (n) => {
        const e = n.expression;
        if (e.type === 'LogicalExpression' && e.operator === '&&' && (e.right.type === 'JSXElement' || e.right.type === 'JSXFragment')) {
          check(e.left.type === 'LogicalExpression' ? e.left : null);
        }
      },
    };
  },
};
