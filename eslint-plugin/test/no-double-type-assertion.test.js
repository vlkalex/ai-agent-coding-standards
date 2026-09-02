'use strict';
const t = require('../test-support/ruleTester');
t.run('no-double-type-assertion', require('../rules/no-double-type-assertion'), {
  valid: ['const a = b as Foo;', 'const a = b as const;', { code: 'const a = <Foo>b;', filename: 'a.ts' }],
  invalid: [
    { code: 'const a = b as unknown as Foo;', errors: [{ messageId: 'double' }] },
    { code: 'const a = (b as any) as Foo;', errors: [{ messageId: 'double' }] },
    { code: 'const a = <Foo>(<unknown>b);', filename: 'a.ts', errors: [{ messageId: 'double' }] },
  ],
});
