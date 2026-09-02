'use strict';
const t = require('../test-support/ruleTester');
t.run('no-tsx-without-jsx', require('../rules/no-tsx-without-jsx'), {
  valid: [
    { code: 'export const A = () => <View/>;', filename: 'A.tsx' },
    { code: 'export const A = () => <></>;', filename: 'A.tsx' },
    { code: 'export const useA = () => 1;', filename: 'useA.ts' },
    { code: 'export type X = 1;', filename: 'types.d.tsx' },
  ],
  invalid: [
    { code: 'export const useA = () => 1;', filename: 'useA.tsx', errors: [{ messageId: 'rename' }] },
  ],
});
