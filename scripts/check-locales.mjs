#!/usr/bin/env node
// Checks the translation files: every key in English exists in Bangla and Arabic
// (and vice versa), and every literal t('…') / $t('…') / tg('…') key used in the
// code exists in English. Exits 1 on any gap.  Usage: node scripts/check-locales.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const LOCALES = ['en', 'bn', 'ar'];
const SRC = ['pages', 'components', 'layouts', 'stores', 'utils', 'composables', 'plugins', 'middleware', 'app.vue', 'error.vue'];

const flatten = (obj, prefix = '', out = {}) => {
    for (const [k, v] of Object.entries(obj)) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === 'object') flatten(v, key, out);
        else out[key] = v;
    }
    return out;
};

const load = (code) => {
    const dir = join('i18n/locales', code);
    const merged = {};
    for (const f of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
        const data = JSON.parse(readFileSync(join(dir, f), 'utf8'));
        for (const top of Object.keys(data)) if (top in merged) console.error(`✗ ${code}/${f}: top-level key "${top}" also defined in another file`);
        Object.assign(merged, data);
    }
    return flatten(merged);
};

const walk = (p, files = []) => {
    try {
        if (statSync(p).isDirectory()) for (const f of readdirSync(p)) walk(join(p, f), files);
        else if (/\.(vue|js|ts|mjs)$/.test(p)) files.push(p);
    } catch {}
    return files;
};

const keys = Object.fromEntries(LOCALES.map((c) => [c, load(c)]));
let problems = 0;
const report = (msg) => {
    problems++;
    console.log(msg);
};

for (const c of LOCALES.slice(1)) {
    for (const k of Object.keys(keys.en)) if (!(k in keys[c])) report(`missing in ${c}: ${k}`);
    for (const k of Object.keys(keys[c])) if (!(k in keys.en)) report(`extra in ${c} (not in en): ${k}`);
    for (const [k, v] of Object.entries(keys[c])) if (v === '') report(`empty in ${c}: ${k}`);
}

const used = new Set();
const re = /(?:\$t|\bt|\btg|\$te|\bte)\(\s*['"`]([a-zA-Z0-9_.-]+)['"`]/g;
for (const f of SRC.flatMap((p) => walk(p))) {
    for (const m of readFileSync(f, 'utf8').matchAll(re)) {
        used.add(m[1]);
        if (!(m[1] in keys.en) && !Object.keys(keys.en).some((k) => k.startsWith(m[1] + '.'))) report(`used but not in en: ${m[1]}  (${f})`);
    }
}

console.log(problems ? `\n${problems} problem(s).` : `✓ ${Object.keys(keys.en).length} keys, all present in ${LOCALES.join('/')}; ${used.size} literal keys used in code.`);
process.exit(problems ? 1 : 0);
