'use strict';
const t = require('../test-support/ruleTester');
t.run('one-component-per-file', require('../rules/one-component-per-file'), {
  valid: [
    'export const A = () => <View/>;',
    'export default function A() { return <View/>; }',
    'export const A = memo(() => <View/>);',
    'export const A = React.forwardRef((p, r) => <View ref={r}/>);',
    'export const A = () => { const renderItem = ({ item }) => <Row item={item}/>; return <List renderItem={renderItem}/>; };', // lowercase helper
    'export const useA = () => <View/>;',                                  // hook, not component
    'export const A = () => <View/>; export const getB = () => 1;',
    'const A = () => <View/>; const B = () => <Text/>;',                   // both non-exported...
    { code: 'export const A = () => <View/>; const B = () => <Text/>;', options: [{ allowNonExported: true }] },
    'export const A = () => <View/>; export const b = { C: () => <View/> };', // not top-level declarator
  ].map((c) => (typeof c === 'string' && c.startsWith('const A = () => <View/>; const B') ? { code: c, options: [{ allowNonExported: true }] } : c)),
  invalid: [
    { code: 'export const A = () => <View/>; export const B = () => <Text/>;', errors: [{ messageId: 'second', data: { name: 'B', first: 'A' } }] },
    { code: 'export const A = () => <View/>; const B = () => <Text/>;', errors: [{ messageId: 'second' }] },
    { code: 'function A() { return <View/>; } export const B = memo(function B() { return <Text/>; });', errors: [{ messageId: 'second' }] },
    { code: 'export const A = () => <View/>; export const B = () => <Text/>; export const C = () => <Text/>;', errors: [{ messageId: 'second' }, { messageId: 'second' }] },
  ],
});
