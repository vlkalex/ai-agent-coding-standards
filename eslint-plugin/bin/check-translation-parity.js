#!/usr/bin/env node
'use strict';
/**
 * Verify every locale carries the same translation keys, and no value matches a forbidden pattern.
 *
 *   check-translation-parity <localesRoot> [--forbid <regex>]... [--reference <locale>]
 *
 * Layout: <localesRoot>/<locale>/<file>.json where <file> may carry a locale prefix
 * (cs_loans.json / cs-loans.json / cs.loans.json) that is normalized away for matching.
 * Exit code 1 when any key is missing in any locale or a forbidden pattern matches.
 */
const fs = require('fs'); const path = require('path');
const args = process.argv.slice(2);
const root = args.find((a) => !a.startsWith('--'));
if (!root) { console.error('usage: check-translation-parity <localesRoot> [--forbid <regex>]... [--reference <locale>]'); process.exit(2); }
const forbid = []; let reference = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--forbid') forbid.push(new RegExp(args[++i]));
  if (args[i] === '--reference') reference = args[++i];
}
const flatten = (obj, prefix = '', out = {}) => {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out); else out[key] = v;
  }
  return out;
};
const locales = fs.readdirSync(root).filter((d) => fs.statSync(path.join(root, d)).isDirectory());
const files = {}; // normalizedName -> { locale -> flatKeys }
for (const locale of locales) {
  for (const f of fs.readdirSync(path.join(root, locale)).filter((f) => f.endsWith('.json'))) {
    const norm = f.replace(new RegExp(`^${locale}[._-]`), '');
    files[norm] = files[norm] || {};
    files[norm][locale] = flatten(JSON.parse(fs.readFileSync(path.join(root, locale, f), 'utf8')));
  }
}
let failures = 0;
for (const [name, byLocale] of Object.entries(files)) {
  const present = Object.keys(byLocale);
  const missingLocales = locales.filter((l) => !present.includes(l));
  if (missingLocales.length) { failures++; console.log(`${name}: file missing in locale(s) ${missingLocales.join(', ')}`); }
  const union = new Set(present.flatMap((l) => Object.keys(byLocale[l])));
  const ref = reference && byLocale[reference] ? new Set(Object.keys(byLocale[reference])) : union;
  for (const l of present) {
    const keys = new Set(Object.keys(byLocale[l]));
    const missing = [...ref].filter((k) => !keys.has(k));
    if (missing.length) { failures += missing.length; console.log(`${name} [${l}]: missing ${missing.length} key(s): ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? ', …' : ''}`); }
    for (const [k, v] of Object.entries(byLocale[l])) {
      for (const re of forbid) if (typeof v === 'string' && re.test(v)) { failures++; console.log(`${name} [${l}] ${k}: value matches forbidden /${re.source}/: "${v}"`); }
    }
  }
}
console.log(failures ? `\n${failures} problem(s)` : `OK — ${Object.keys(files).length} file(s) × ${locales.length} locale(s) in parity`);
process.exit(failures ? 1 : 0);
