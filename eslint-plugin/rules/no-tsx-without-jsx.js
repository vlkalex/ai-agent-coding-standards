'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: { description: 'A .tsx file that contains no JSX must use the .ts extension.' },
    schema: [],
    messages: { rename: 'This .tsx file contains no JSX. Rename it to .ts.' },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (!/\.tsx$/.test(filename) || /\.d\.tsx$/.test(filename)) return {};
    let sawJsx = false;
    return {
      'JSXElement, JSXFragment'() { sawJsx = true; },
      'Program:exit'(node) {
        if (!sawJsx) context.report({ node, loc: { line: 1, column: 0 }, messageId: 'rename' });
      },
    };
  },
};
