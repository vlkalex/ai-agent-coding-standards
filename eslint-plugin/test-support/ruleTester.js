'use strict';
const { RuleTester } = require('eslint');
const parser = require('@typescript-eslint/parser');
module.exports = new RuleTester({
  languageOptions: { parser, parserOptions: { ecmaFeatures: { jsx: true }, ecmaVersion: 'latest', sourceType: 'module' } },
});
