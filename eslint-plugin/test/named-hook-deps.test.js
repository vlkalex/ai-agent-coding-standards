'use strict';
const t = require('../test-support/ruleTester');
t.run('named-hook-deps', require('../rules/named-hook-deps'), {
  valid: [
    'useEffect(() => { run(); }, [run, state]);',
    'useEffect(() => { run(); });',
    'React.useMemo(() => x, [x]);',
    'const v = useCallback(() => {}, []);',
    'somethingElse(() => {}, [a.b]);',
    { code: 'useCustom(() => {}, [a.b]);', options: [{ hooks: ['useEffect'] }] },
  ],
  invalid: [
    { code: 'useEffect(() => { run(); }, [query.errorUpdatedAt, run, app?.state]);', errors: [{ messageId: 'extract', data: { text: 'query.errorUpdatedAt', suggestion: 'errorUpdatedAt' } }, { messageId: 'extract', data: { text: 'app?.state', suggestion: 'state' } }] },
    { code: 'useMemo(() => x, [props.items.length]);', errors: [{ messageId: 'extract' }] },
    { code: 'useCustom(() => {}, [a.b]);', options: [{ additionalHooks: '^useCustom$' }], errors: [{ messageId: 'extract' }] },
  ],
});
