'use strict';
const t = require('../test-support/ruleTester');
t.run('no-optional-boolean', require('../rules/no-optional-boolean'), {
  valid: [
    'type P = { disabled: boolean };',
    'type P = { label?: string };',
    'const f = (disabled: boolean) => disabled;',
    'const f = (disabled = false) => disabled;',
  ],
  invalid: [
    { code: 'type P = { disabled?: boolean };', errors: [{ messageId: 'optional', data: { name: 'disabled' } }] },
    { code: 'type P = { disabled: boolean | undefined };', errors: [{ messageId: 'optional' }] },
    { code: 'const f = (disabled?: boolean) => disabled;', errors: [{ messageId: 'optional', data: { name: 'disabled' } }] },
    { code: 'interface P { on?: boolean }', errors: [{ messageId: 'optional' }] },
  ],
});
