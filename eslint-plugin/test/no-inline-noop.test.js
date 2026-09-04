'use strict';
const t = require('../test-support/ruleTester');
t.run('no-inline-noop', require('../rules/no-inline-noop'), {
  valid: [
    'const noop = () => {};',                           // the shared definition itself
    'onPress(() => { track(); });',
    '<Button onPress={noop} />;',
    '<Button onPress={() => doSomething()} />;',
    'const handler = (e) => {};',                       // has params: intentional signature
  ],
  invalid: [
    { code: '<Button onPress={() => {}} />;', errors: [{ messageId: 'useShared' }] },
    { code: 'subscribe(() => {});', errors: [{ messageId: 'useShared' }] },
    { code: 'const o = { onClose: () => {} };', errors: [{ messageId: 'useShared' }] },
    { code: 'const o = { onClose: function () {} };', errors: [{ messageId: 'useShared' }] },
    { code: 'const cb = () => {};', options: [{ noopName: 'noop', importSource: '@app/helpers/noop' }], errors: [{ messageId: 'useShared', data: { noopName: 'noop', from: ' from `@app/helpers/noop`' } }] },
  ],
});
