'use strict';
const t = require('../test-support/ruleTester');
const opts = [[{ files: 'Screen\\.tsx$', ignore: '\\.test\\.tsx$', calls: ['useSendAnalyticsOnMount', 'useSendExponeaPageViewEvent'], message: 'Every screen ships with tracking.' }]];
t.run('require-call-in-file', require('../rules/require-call-in-file'), {
  valid: [
    { code: 'const A = () => { useSendAnalyticsOnMount(e); useSendExponeaPageViewEvent(p); return <View/>; };', filename: 'AScreen.tsx', options: opts },
    { code: 'const A = () => { tracking.useSendAnalyticsOnMount(e); useSendExponeaPageViewEvent(p); return null; };', filename: 'AScreen.tsx', options: opts },
    { code: 'const A = () => null;', filename: 'AContent.tsx', options: opts },
    { code: 'const A = () => null;', filename: 'AScreen.test.tsx', options: opts },
    { code: 'const A = () => null;', filename: 'AScreen.tsx' },   // no options → nothing required
  ],
  invalid: [
    { code: 'const A = () => { useSendAnalyticsOnMount(e); return null; };', filename: 'AScreen.tsx', options: opts, errors: [{ messageId: 'missing', data: { call: 'useSendExponeaPageViewEvent', files: 'Screen\\.tsx$', message: 'Every screen ships with tracking.' } }] },
    { code: 'const A = () => null;', filename: 'WaitingScreen.tsx', options: opts, errors: [{ messageId: 'missing' }, { messageId: 'missing' }] },
  ],
});
