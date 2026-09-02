'use strict';
const WRAPPERS = new Set(['memo', 'forwardRef', 'observer', 'styled']);

module.exports = {
  meta: {
    type: 'suggestion',
    docs: { description: 'One React component per file. A second top-level component (any uppercase-named function that renders JSX) must move to its own file.' },
    schema: [{
      type: 'object',
      properties: { allowNonExported: { type: 'boolean' } },
      additionalProperties: false,
    }],
    messages: { second: 'Component `{{name}}` shares a file with `{{first}}`. One component per file: move `{{name}}` to its own file.' },
  },
  create(context) {
    const allowNonExported = (context.options[0] || {}).allowNonExported ?? false;
    const stack = []; // candidate component functions currently being traversed
    const found = []; // { name, node, exported }

    const isTopLevelDecl = (decl) => {
      const p = decl.parent;
      if (!p) return false;
      if (p.type === 'Program') return { exported: false };
      if ((p.type === 'ExportNamedDeclaration' || p.type === 'ExportDefaultDeclaration') && p.parent && p.parent.type === 'Program') return { exported: true };
      return false;
    };
    const isComponentName = (name) => typeof name === 'string' && /^[A-Z]/.test(name);

    // Resolve the "component name" for a function node if it is a top-level component candidate.
    const candidateInfo = (fn) => {
      if (fn.type === 'FunctionDeclaration' && fn.id && isComponentName(fn.id.name)) {
        const top = isTopLevelDecl(fn);
        return top && { name: fn.id.name, exported: top.exported };
      }
      let p = fn.parent;
      // unwrap memo(...) / forwardRef(...) / observer(...)
      if (p && p.type === 'CallExpression' && p.arguments[0] === fn) {
        const callee = p.callee;
        const cname = callee.type === 'Identifier' ? callee.name : (callee.type === 'MemberExpression' && !callee.computed ? callee.property.name : null);
        if (cname && WRAPPERS.has(cname)) p = p.parent;
      }
      if (p && p.type === 'VariableDeclarator' && p.id.type === 'Identifier' && isComponentName(p.id.name)) {
        const decl = p.parent;
        const top = decl && decl.type === 'VariableDeclaration' ? isTopLevelDecl(decl) : false;
        return top && { name: p.id.name, exported: top.exported };
      }
      return null;
    };

    const enter = (fn) => {
      const info = candidateInfo(fn);
      stack.push(info ? { ...info, node: fn, jsx: false } : null);
    };
    const exit = () => {
      const entry = stack.pop();
      if (entry && entry.jsx) found.push(entry);
    };

    return {
      'FunctionDeclaration, FunctionExpression, ArrowFunctionExpression': enter,
      'FunctionDeclaration:exit': exit, 'FunctionExpression:exit': exit, 'ArrowFunctionExpression:exit': exit,
      'JSXElement, JSXFragment'() { for (const e of stack) if (e) e.jsx = true; },
      'Program:exit'() {
        const components = found
          .filter((c) => !allowNonExported || c.exported)
          .sort((a, b) => a.node.range[0] - b.node.range[0]);
        if (components.length < 2) return;
        const first = components[0];
        for (const c of components.slice(1)) {
          context.report({ node: c.node, messageId: 'second', data: { name: c.name, first: first.name } });
        }
      },
    };
  },
};
