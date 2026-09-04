'use strict';
const t = require('../test-support/ruleTester');
t.run('maybe-prefix-conditional-element', require('../rules/maybe-prefix-conditional-element'), {
  valid: [
    'const maybeError = hasError ? <Error/> : null;',
    'const maybeHint = showHint && <Hint/>;',
    'const element = <View/>;',
    'const label = hasError ? "a" : null;',
    'const icon = hasError ? <A/> : <B/>;',                 // always renders something
    { code: 'const optError = hasError ? <Error/> : null;', options: [{ prefix: 'opt' }] },
  ],
  invalid: [
    { code: 'const recalculationErrorElement = hasRecalculationError ? <Error/> : null;', errors: [{ messageId: 'rename', data: { name: 'recalculationErrorElement', suggestion: 'maybeRecalculationErrorElement' } }] },
    { code: 'const hint = showHint && <Hint/>;', errors: [{ messageId: 'rename' }] },
    { code: 'const footer = isDone ? undefined : <Footer/>;', errors: [{ messageId: 'rename' }] },
  ],
});
