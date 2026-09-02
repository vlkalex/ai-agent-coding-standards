'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Limit comment length. Reviewers flag verbose, narrating (AI-style) comments; state only the non-obvious why.' },
    schema: [{
      type: 'object',
      properties: { maxLines: { type: 'integer', minimum: 1 }, maxJsDocLines: { type: 'integer', minimum: 1 } },
      additionalProperties: false,
    }],
    messages: { verbose: 'Comment spans {{lines}} lines (max {{max}}). Keep comments to the non-obvious "why"; delete narration of what the code does.' },
  },
  create(context) {
    const opts = context.options[0] || {};
    const maxLines = opts.maxLines ?? 3;
    const maxJsDoc = opts.maxJsDocLines ?? 12;
    const src = context.sourceCode;
    const isDirective = (c) => /^\s*(eslint|@ts-|prettier-|istanbul|global\b|jsx\b|c8 |v8 )/.test(c.value);
    const isHeader = (c, i) => i === 0 && /license|copyright|@see/i.test(c.value);

    return {
      'Program:exit'() {
        const comments = src.getAllComments();
        let i = 0;
        while (i < comments.length) {
          const c = comments[i];
          if (isDirective(c) || isHeader(c, i)) { i += 1; continue; }
          if (c.type === 'Block') {
            const lines = c.loc.end.line - c.loc.start.line + 1;
            const jsdoc = c.value.startsWith('*');
            const limit = jsdoc ? maxJsDoc : maxLines;
            if (lines > limit) context.report({ loc: c.loc, messageId: 'verbose', data: { lines, max: limit } });
            i += 1; continue;
          }
          // group consecutive line comments
          let j = i;
          while (j + 1 < comments.length && comments[j + 1].type === 'Line' && comments[j + 1].loc.start.line === comments[j].loc.start.line + 1 && !isDirective(comments[j + 1])) j += 1;
          const lines = j - i + 1;
          if (lines > maxLines) {
            context.report({ loc: { start: comments[i].loc.start, end: comments[j].loc.end }, messageId: 'verbose', data: { lines, max: maxLines } });
          }
          i = j + 1;
        }
      },
    };
  },
};
