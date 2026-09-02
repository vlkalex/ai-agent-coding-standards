'use strict';
const t = require('../test-support/ruleTester');
t.run('prefer-named-types', require('../rules/prefer-named-types'), {
  valid: [
    'type Props = { a: string; b: number; c: boolean };',
    'interface Props { a: string; b: number; c: boolean }',
    'const f = (p: { a: string; b: number }) => p;',
    'type X = { nested: { a: 1; b: 2; c: 3 } };',
    { code: 'const f = (p: { a: string; b: number; c: 1 }) => p;', options: [{ minMembers: 4 }] },
  ],
  invalid: [
    { code: 'const f = (p: { a: string; b: number; c: boolean }) => p;', errors: [{ messageId: 'extract', data: { count: 3 } }] },
    { code: 'const [s] = useState<{ a: 1; b: 2; c: 3 }>();', errors: [{ messageId: 'extract' }] },
    { code: 'export const A = (props: Base & { a: 1; b: 2; c: 3 }) => null;', errors: [{ messageId: 'extract' }] },
    { code: 'function f(): { a: 1; b: 2; c: 3 } { return x; }', errors: [{ messageId: 'extract' }] },
  ],
});
