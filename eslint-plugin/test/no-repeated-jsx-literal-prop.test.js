'use strict';
const t = require('../test-support/ruleTester');
t.run('no-repeated-jsx-literal-prop', require('../rules/no-repeated-jsx-literal-prop'), {
  valid: [
    'const a = <><Text category="p2"/><Text category="p2"/></>;',
    'const a = <><Text category="p2"/><Text category="p2"/><Label category="p2"/></>;',   // different elements
    'const a = <><Text testID="x"/><Text testID="x"/><Text testID="x"/></>;',              // ignored prop
    'const a = <><Text category={category}/><Text category={category}/><Text category={category}/></>;',
    { code: 'const a = <><Text category="p2"/><Text category="p2"/><Text category="p2"/></>;', options: [{ min: 4 }] },
  ],
  invalid: [
    { code: 'const a = <><Text category="p2"/><Text category="p2"/><Text category="p2"/></>;', errors: [{ messageId: 'repeated', data: { prop: 'category', value: '"p2"', count: 3, element: 'Text' } }] },
    { code: 'const a = <><Text size={16}/><Text size={16}/><Text size={16}/></>;', errors: [{ messageId: 'repeated' }] },
    { code: 'const a = <><Text category="p2"/><Text category="p2"/><Label category="p2"/></>;', options: [{ perElement: false }], errors: [{ messageId: 'repeated' }] },
  ],
});
