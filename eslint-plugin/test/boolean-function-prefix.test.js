'use strict';
const t = require('../test-support/ruleTester');
t.run('boolean-function-prefix', require('../rules/boolean-function-prefix'), {
  valid: [
    'const isReady = (s) => s === 1;',
    'const getName = (u) => u.name;',
    'const getItems = (a) => a.filter(Boolean);',
    'function getUser() { if (x) return null; return user; }',
    'const getCount = (a) => a.length > 0 ? a.length : 0;',      // conditional with non-boolean branches
    { code: 'const getFlag = (s) => s === 1;', options: [{ forbiddenPrefix: 'fetch' }] },
    'const getIsEnabled = (s) => s === 1;',                    // predicate word after get: accepted idiom
    'const getHasReachedEnd = (y) => y >= max;',
    'const getSchema = () => yup.string().test("x", "m", (v) => !!v);',   // .test() is not a boolean signal
  ],
  invalid: [
    { code: 'const getIsEnabled = (s) => s === 1;', options: [{ allowPredicateAfterPrefix: false }], errors: [{ messageId: 'rename', data: { name: 'getIsEnabled', suggestion: 'isIsEnabled', prefixes: 'is/has/can/should/check' } }] },
    { code: 'const getHideAmountsAlreadyDisplayed = (s) => s.count > 0;', errors: [{ messageId: 'rename' }] },
    { code: 'const getInsurancesDetailPage = (p) => p.type === "insurance" && p.enabled;', errors: [{ messageId: 'rename' }] },
    { code: 'function getValid(x) { if (!x) return false; return x.items.some(Boolean); }', errors: [{ messageId: 'rename' }] },
    { code: 'const getEnabled = (x): boolean => compute(x);', errors: [{ messageId: 'rename' }] },
    { code: 'const getEmpty = (a) => !a.length;', errors: [{ messageId: 'rename' }] },
  ],
});
