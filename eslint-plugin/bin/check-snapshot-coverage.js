#!/usr/bin/env node
'use strict';
/**
 * Every changed/added component file must have a sibling component test.
 *
 *   check-snapshot-coverage [--base <git-ref>] [--component <regex>] [--test-suffix <suffix>] [--strict]
 *
 * Defaults: base=master, component=/components\/.*\.tsx$/ (excluding *.test.tsx),
 * test-suffix=.comp.test.tsx. Considers committed changes since base AND uncommitted/untracked files.
 * Exit 1 only with --strict; otherwise prints warnings.
 */
const { execSync } = require('child_process'); const fs = require('fs'); const path = require('path');
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const base = opt('--base', 'master');
const componentRe = new RegExp(opt('--component', 'components/.*\\.tsx$'));
const suffix = opt('--test-suffix', '.comp.test.tsx');
const strict = args.includes('--strict');
const git = (cmd) => execSync(`git ${cmd}`, { encoding: 'utf8' }).split('\n').filter(Boolean);
let changed = [];
try { changed = git(`diff --name-only --diff-filter=AM ${base}...HEAD`); } catch { changed = []; }
changed = changed.concat(git('diff --name-only --diff-filter=AM'), git('ls-files --others --exclude-standard'));
const components = [...new Set(changed)].filter((f) => componentRe.test(f) && !/\.test\.tsx$/.test(f) && !/\.stories\.tsx$/.test(f));
const missing = components.filter((f) => {
  const dir = path.dirname(f); const name = path.basename(f, '.tsx');
  const candidates = [path.join(dir, name + suffix), path.join(dir, '__tests__', name + suffix), path.join(dir, name + '.test.tsx')];
  return !candidates.some((c) => fs.existsSync(c));
});
for (const f of missing) console.log(`${strict ? 'error' : 'warning'}: ${f} has no ${suffix} sibling (visual components need snapshot coverage)`);
console.log(missing.length ? `\n${missing.length} of ${components.length} changed component file(s) lack a component test` : `OK — ${components.length} changed component file(s) all have component tests`);
process.exit(strict && missing.length ? 1 : 0);
