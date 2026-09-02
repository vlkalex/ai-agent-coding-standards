'use strict';
const DEFAULT_HOOKS = ['useEffect', 'useLayoutEffect', 'useMemo', 'useCallback', 'useImperativeHandle', 'useInsertionEffect'];

module.exports = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Hook dependency arrays may only contain plain identifiers; extract member access / optional chains into named consts above the hook.' },
    schema: [{
      type: 'object',
      properties: { hooks: { type: 'array', items: { type: 'string' } }, additionalHooks: { type: 'string' } },
      additionalProperties: false,
    }],
    messages: { extract: 'Dependency `{{text}}` should be a named const declared above the hook (e.g. `const {{suggestion}} = {{text}};`).' },
  },
  create(context) {
    const opts = context.options[0] || {};
    const hooks = new Set(opts.hooks || DEFAULT_HOOKS);
    const extra = opts.additionalHooks ? new RegExp(opts.additionalHooks) : null;
    const src = context.sourceCode;

    const hookName = (callee) => {
      if (callee.type === 'Identifier') return callee.name;
      if (callee.type === 'MemberExpression' && !callee.computed && callee.property.type === 'Identifier') return callee.property.name;
      return null;
    };
    const suggestName = (text) => {
      const last = text.replace(/[?!]/g, '').split('.').pop() || 'value';
      return last.replace(/[^A-Za-z0-9_$]/g, '') || 'value';
    };

    return {
      CallExpression(node) {
        const name = hookName(node.callee);
        if (!name || !(hooks.has(name) || (extra && extra.test(name)))) return;
        const deps = node.arguments[node.arguments.length - 1];
        if (!deps || deps.type !== 'ArrayExpression' || node.arguments.length < 2) return;
        for (const el of deps.elements) {
          if (!el || el.type === 'Identifier') continue;
          const text = src.getText(el);
          context.report({ node: el, messageId: 'extract', data: { text, suggestion: suggestName(text) } });
        }
      },
    };
  },
};
