'use strict';
const DEFAULT_TERMS = ['TODO', 'FIXME', 'HACK'];
// Tracker keys (ABC-12) or a URL. Set a project-specific pattern, e.g. '\\b(?:PAY|WEB)-\\d+\\b',
// to stop keys-that-are-not-tickets such as ISO-8601 or ES-2015 from passing.
const DEFAULT_TICKET_PATTERN = '\\b[A-Z][A-Z0-9]{1,9}-\\d{2,}\\b|https?://\\S+';

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const compileTicketPattern = (pattern) => {
  try {
    return new RegExp(pattern);
  } catch (error) {
    throw new Error(`todo-requires-ticket: invalid ticketPattern /${pattern}/: ${error.message}`);
  }
};

/**
 * A TODO note is its comment plus the own-line `//` comments directly below it, so a ticket
 * on the next line counts. A note ends at a blank line, at code, or at the next TODO.
 */
const groupNotes = (comments, sourceCode, termRegex) => {
  const isOwnLine = (comment) =>
    sourceCode.lines[comment.loc.start.line - 1].slice(0, comment.loc.start.column).trim() === '';
  const notes = [];
  for (const comment of comments) {
    const note = notes[notes.length - 1];
    const previous = note && note[note.length - 1];
    const continuesNote = previous && previous.type === 'Line' && comment.type === 'Line' &&
      isOwnLine(note[0]) && isOwnLine(comment) &&
      comment.loc.start.line === previous.loc.end.line + 1 && !termRegex.test(comment.value);
    if (continuesNote) note.push(comment);
    else notes.push([comment]);
  }
  return notes;
};

module.exports = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Require TODO-style comments to reference the ticket that will remove them.' },
    schema: [{
      type: 'object',
      properties: {
        terms: { type: 'array', items: { type: 'string' }, minItems: 1 },
        ticketPattern: { type: 'string' },
      },
      additionalProperties: false,
    }],
    messages: { missingTicket: '{{term}} without a ticket. Reference the ticket that will remove it (matching /{{pattern}}/).' },
  },
  create(context) {
    const opts = context.options[0] || {};
    const terms = opts.terms || DEFAULT_TERMS;
    const pattern = opts.ticketPattern || DEFAULT_TICKET_PATTERN;
    const termRegex = new RegExp(`(?<![\\w])(${terms.map(escapeRegExp).join('|')})(?![\\w])`);
    const ticketRegex = compileTicketPattern(pattern);
    return {
      Program() {
        const { sourceCode } = context;
        for (const note of groupNotes(sourceCode.getAllComments(), sourceCode, termRegex)) {
          const [first] = note;
          const match = termRegex.exec(first.value);
          const hasTicket = ticketRegex.test(note.map((comment) => comment.value).join('\n'));
          if (match && !hasTicket) context.report({ loc: first.loc, messageId: 'missingTicket', data: { term: match[1], pattern } });
        }
      },
    };
  },
};
