'use strict';
const t = require('../test-support/ruleTester');
t.run('named-condition', require('../rules/named-condition'), {
  valid: [
    'if (isDone) go();',
    'if (isDone && hasItems) go();',
    'if (!isDone && user.isAdmin) go();',
    'const x = isDone ? 1 : 2;',
    'if (state === DRAFT) go();',                       // single comparison is fine
    'const isDraft = state === DRAFT && hasItems;',      // this IS the extraction
    { code: 'if (state === DRAFT && hasItems) go();', options: [{ allowComparisonOperands: true }] },
    { code: 'if (a && b && c) go();', options: [{ maxLogicalOperators: 2 }] },
    'const el = <View>{isDone && <Text/>}</View>;',
  ],
  invalid: [
    { code: 'if (isDone || state === LOCKED || isPending) go();', errors: [{ messageId: 'tooManyOperators' }] },
    { code: 'if (state === DRAFT && hasItems) go();', errors: [{ messageId: 'unnamedOperand' }] },
    { code: 'const onPress = isDone || isLocked || isPending ? undefined : open;', errors: [{ messageId: 'tooManyOperators' }] },
    { code: 'const el = <View>{items.length > 0 && isReady && <List/>}</View>;', errors: [{ messageId: 'unnamedOperand' }] },
    { code: 'while (i < n && !done) i++;', errors: [{ messageId: 'unnamedOperand' }] },
    { code: 'if (getFlag() && isReady) go();', errors: [{ messageId: 'unnamedOperand' }] },
  ],
});
