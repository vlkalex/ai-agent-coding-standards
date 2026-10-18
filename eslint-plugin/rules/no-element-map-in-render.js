'use strict';
const isFunction = (n) =>
  n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression';

const isElement = (n) => n && (n.type === 'JSXElement' || n.type === 'JSXFragment');

const isLiteralKey = (key) =>
  key.type === 'Literal' || (key.type === 'TemplateLiteral' && key.expressions.length === 0);

const isAssignmentTarget = (member) =>
  member.parent.type === 'AssignmentExpression' && member.parent.left === member;

/** `Object.keys(map).map((key) => map[key])` renders every entry: nothing is picked. */
const isIterationOverSameMap = (member) => {
  const { object, property } = member;
  if (object.type !== 'Identifier' || property.type !== 'Identifier') return false;
  let fn = member.parent;
  while (fn && !isFunction(fn)) fn = fn.parent;
  if (!fn || !fn.params.some((param) => param.type === 'Identifier' && param.name === property.name)) return false;
  const call = fn.parent;
  const iterated = call && call.type === 'CallExpression' && call.callee.type === 'MemberExpression' && call.callee.object;
  return Boolean(iterated) && iterated.type === 'CallExpression' &&
    iterated.callee.type === 'MemberExpression' && iterated.callee.object.type === 'Identifier' &&
    iterated.callee.object.name === 'Object' && iterated.arguments[0] &&
    iterated.arguments[0].type === 'Identifier' && iterated.arguments[0].name === object.name;
};

const isComputedLookupOf = (node) => {
  const member = node.parent;
  return Boolean(member) && member.type === 'MemberExpression' && member.computed && member.object === node &&
    !isLiteralKey(member.property) && !isAssignmentTarget(member) && !isIterationOverSameMap(member);
};

const unwrapTypeWrappers = (node) => {
  let current = node;
  while (current.parent && ['TSSatisfiesExpression', 'TSAsExpression'].includes(current.parent.type)) current = current.parent;
  return current;
};

module.exports = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Disallow picking one JSX element from a map built inside a function; every variant is created on every call. Use an exhaustive switch in its own component, or a module-scope map.' },
    schema: [{
      type: 'object',
      properties: { min: { type: 'integer', minimum: 2 } },
      additionalProperties: false,
    }],
    messages: { elementMap: 'One of {{count}} JSX elements is picked by key, but all are created on every call. Use an exhaustive `switch` in its own component, or move a prop-less map to module scope.' },
  },
  create(context) {
    const min = (context.options[0] || {}).min || 2;
    const { sourceCode } = context;

    const isPickedByKey = (objectNode) => {
      const expression = unwrapTypeWrappers(objectNode);
      if (isComputedLookupOf(expression)) return true;
      const declarator = expression.parent;
      if (!declarator || declarator.type !== 'VariableDeclarator' || declarator.init !== expression) return false;
      return sourceCode.getDeclaredVariables(declarator)
        .some((variable) => variable.references.some((ref) => isComputedLookupOf(ref.identifier)));
    };

    return {
      ObjectExpression(node) {
        const count = node.properties.filter((p) => p.type === 'Property' && isElement(p.value)).length;
        if (count < min) return;
        const isInsideFunction = sourceCode.getAncestors(node).some(isFunction);
        if (isInsideFunction && isPickedByKey(node)) context.report({ node, messageId: 'elementMap', data: { count } });
      },
    };
  },
};
