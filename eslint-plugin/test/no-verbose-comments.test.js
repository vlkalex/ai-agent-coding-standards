'use strict';
const t = require('../test-support/ruleTester');
t.run('no-verbose-comments', require('../rules/no-verbose-comments'), {
  valid: [
    '// short\nconst a = 1;',
    '// one\n// two\n// three\nconst a = 1;',
    '// one\n// two\n// three\n\n// four\nconst a = 1;',           // blank line breaks the group
    '/** @see https://x\n * @param a\n * @returns b\n */\nconst a = 1;',
    '// @ts-expect-error\n// @ts-expect-error\n// prettier-ignore\n// @ts-expect-error\nconst a = 1;',
    '/* Copyright 2026\n * license\n * text\n * here\n */\nconst a = 1;',
    { code: '// 1\n// 2\n// 3\n// 4\n// 5\nconst a = 1;', options: [{ maxLines: 5 }] },
  ],
  invalid: [
    { code: '// This function takes the user\n// and then checks whether it is valid\n// and then it returns the result\n// which is then used by the caller\nconst a = 1;', errors: [{ messageId: 'verbose', data: { lines: 4, max: 3 } }] },
    { code: '/*\n a\n b\n c\n d\n*/\nconst a = 1;', errors: [{ messageId: 'verbose' }] },
    { code: '/**\n * 1\n * 2\n * 3\n * 4\n * 5\n * 6\n * 7\n * 8\n * 9\n * 10\n * 11\n * 12\n */\nconst a = 1;', errors: [{ messageId: 'verbose', data: { lines: 14, max: 12 } }] },
  ],
});
