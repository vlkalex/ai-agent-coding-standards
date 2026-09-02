'use strict';
const t = require('../test-support/ruleTester');
const opts = [{ convertErrorToAppError: 'de-facto deprecated; use createAppErrorFromMessage', lodashNoop: 'use the shared noop' }];
t.run('no-banned-identifiers', require('../rules/no-banned-identifiers'), {
  valid: [
    { code: 'import { convertErrorToAppError } from "x"; convertErrorToAppError(e);' }, // no options → off
    { code: 'import { other } from "x"; other();', options: opts },
    { code: 'const o = { convertErrorToAppError: 1 };', options: opts },   // property key, not a usage
  ],
  invalid: [
    { code: 'import { convertErrorToAppError } from "x";', options: opts, errors: [{ messageId: 'banned' }] },
    { code: 'convertErrorToAppError(e);', options: opts, errors: [{ messageId: 'banned', data: { name: 'convertErrorToAppError', reason: 'de-facto deprecated; use createAppErrorFromMessage' } }] },
    { code: 'errors.convertErrorToAppError(e);', options: opts, errors: [{ messageId: 'banned' }] },
    { code: 'import lodashNoop from "lodash/noop";', options: opts, errors: [{ messageId: 'banned' }] },
  ],
});
