'use strict';
const t = require('../test-support/ruleTester');
t.run('no-element-map-in-render', require('../rules/no-element-map-in-render'), {
  valid: [
    // module scope: created once
    'const CONTENT_BY_STATE = { draft: <DraftContent />, done: <DoneContent /> }; const C = ({ s }) => CONTENT_BY_STATE[s];',
    // a conditional element is not a map
    'const Fields = ({ isCompany }) => { const fields = isCompany ? <CompanyFields /> : <PersonFields />; return fields; };',
    // slots: every element is rendered, none is picked by key
    'const Screen = () => { const page = { top: <Header />, bottom: <Tabs /> }; return <Details page={page} />; };',
    'const Screen = () => <Layout slots={{ header: <Header />, footer: <Footer /> }} />;',
    'const Screen = () => { const slots = { a: <A />, b: <B /> }; return slots.a; };',
    // exhaustive switch
    'const Fields = ({ variant }) => { switch (variant) { case "a": return <A />; default: return <B />; } };',
    { code: 'const F = ({ k }) => { const m = { a: <A />, b: <B /> }; return m[k]; };', options: [{ min: 3 }] },
    // literal keys, writes, and iterating every entry pick nothing
    "const F = () => { const m = { a: <A />, b: <B /> }; return m['a']; };",
    'const F = ({ k }) => { const m = { a: <A />, b: <B /> }; m[k] = null; return m; };',
    'const F = () => { const m = { a: <A />, b: <B /> }; return Object.keys(m).map((key) => m[key]); };',
  ],
  invalid: [
    {
      code: 'const Fields = ({ variant, names }) => { const byVariant = { person: <PersonFields names={names} />, company: <CompanyFields names={names} /> }; return byVariant[variant]; };',
      errors: [{ messageId: 'elementMap', data: { count: 2 } }],
    },
    {
      code: 'const Icon = ({ option }) => { const iconByOption = { local: <Phone />, remote: <Watch />, none: undefined } satisfies Record<Option, JSX.Element | undefined>; return iconByOption[option]; };',
      errors: [{ messageId: 'elementMap' }],
    },
    {
      code: 'function useContent(kind) { return ({ header: <Header />, body: <></> })[kind]; }',
      errors: [{ messageId: 'elementMap' }],
    },
    {
      code: 'const F = ({ k }) => { const m = { a: <A />, b: <B /> }; return m?.[k]; };',
      errors: [{ messageId: 'elementMap' }],
    },
  ],
});
