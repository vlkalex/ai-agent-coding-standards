'use strict';
const t = require('../test-support/ruleTester');
const DEFAULT_PATTERN = '\\b[A-Z][A-Z0-9]{1,9}-\\d{2,}\\b|https?://\\S+';
t.run('todo-requires-ticket', require('../rules/todo-requires-ticket'), {
  valid: [
    '// TODO: ABC-123 send the currency from the backend',
    '// TODO https://tracker.example.com/browse/ABC-123',
    '/* FIXME(PAY-42): remove after migration */',
    '// TODO: send the currency from the backend\n// ABC-123',   // ticket on the next line of the same note
    '// Todo lists are rendered below',                          // not the uppercase marker
    '// format: XXX-XXX',                                        // XXX is not a default term
    { code: '// TODO PAY-9 fix', options: [{ ticketPattern: 'PAY-\\d+' }] },
    { code: '// HACK: works around a vendor bug', options: [{ terms: ['TODO'] }] },
    { code: '// C++ TODO? no', options: [{ terms: ['C++'], ticketPattern: 'no' }] },  // terms are escaped
  ],
  invalid: [
    { code: '// TODO: send the currency from the backend', errors: [{ messageId: 'missingTicket', data: { term: 'TODO', pattern: DEFAULT_PATTERN } }] },
    { code: '/* FIXME remove after migration */', errors: [{ messageId: 'missingTicket' }] },
    { code: 'const amount = 1; // HACK hardcoded until the API ships', errors: [{ messageId: 'missingTicket' }] },
    { code: '// TODO fix colour #123456', errors: [{ messageId: 'missingTicket' }] },
    { code: '// TODO: handle UTF-8', errors: [{ messageId: 'missingTicket' }] },
    { code: '// TODO: first note\n\n// ABC-123 unrelated', errors: [{ messageId: 'missingTicket' }] },  // a blank line ends the note
    { code: '// TODO ABC-123', options: [{ ticketPattern: 'PAY-\\d+' }], errors: [{ messageId: 'missingTicket' }] },
    { code: '// TODO: a\n// TODO: b ABC-12', errors: [{ messageId: 'missingTicket', line: 1 }] },  // each TODO needs its own ticket
    { code: 'const a = 1; // TODO fix\n// ABC-12 unrelated', errors: [{ messageId: 'missingTicket' }] },  // a trailing comment is its own note
    { code: '// C++ is fine', options: [{ terms: ['C++'] }], errors: [{ messageId: 'missingTicket', data: { term: 'C++', pattern: DEFAULT_PATTERN } }] },
  ],
});
