#!/usr/bin/env node
/**
 * i18n statik tekshiruvi — ikki narsani kafolatlaydi:
 *
 *  1. **Lug'atlar sinxron**: uz/ru/en kalit to'plami AYNAN bir xil va ICU
 *     argumentlari mos (bitta tilda `{count}` unutilsa, o'sha tilda sahifa
 *     runtime'da yiqilardi).
 *  2. **Xabarlar yetib boradi**: har bir client komponent `useTranslations('x')`
 *     bilan so'ragan nomlar maydoni (namespace) o'sha marshrutga yuborilgan
 *     bo'lishi SHART — global ro'yxatda yoki marshrut ajdodidagi
 *     `MessagesScope` (SCOPES) orqali. Aks holda brauzerda
 *     "MISSING_MESSAGE" bo'lardi — faqat o'sha sahifaga kirilganda.
 *
 * Ishlatish:  node scripts/i18n-check.mjs [--report]
 *   --report — marshrut → namespace jadvalini chiqaradi (tekshiruvsiz).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, TYPE } from '@formatjs/icu-messageformat-parser';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const APP = path.join(SRC, 'app', '[locale]');
const MESSAGES = path.join(ROOT, 'messages');
const LOCALES = ['uz', 'ru', 'en', 'ar', 'zh'];
const REPORT = process.argv.includes('--report');

let failed = 0;
const fail = (msg) => { console.error('  ✗ ' + msg); failed++; };

/* ───────────────────────── 1. Lug'at parity ───────────────────────── */
const dicts = Object.fromEntries(
  LOCALES.map((l) => [l, JSON.parse(fs.readFileSync(path.join(MESSAGES, `${l}.json`), 'utf8'))]),
);

function flat(obj, prefix = '', out = new Map()) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flat(v, key, out);
    else out.set(key, String(v));
  }
  return out;
}

/**
 * ICU argument nomlari — HAQIQIY parser bilan (`@formatjs/icu-messageformat-parser`,
 * next-intl ishlatadigan aynan o'sha). Qo'lda regex bilan olish mumkin emas:
 * `{type, select, startup {Startap} …}` da `{Startap}` — variant MATNI, argument
 * emas; regex ikkalasini ajrata olmaydi.
 *
 * Plural/select variantlari ham kirib boriladi: ichkaridagi `{count}` haqiqiy
 * argument. `null` — matn ICU sifatida yaroqsiz (o'sha tilda runtime xatosi).
 */
function icuArgs(text) {
  let ast;
  try {
    ast = parse(text, { requiresOtherClause: false });
  } catch {
    return null;
  }
  const args = new Set();
  const walk = (nodes) => {
    for (const n of nodes) {
      if (n.value !== undefined && n.type !== TYPE.literal) args.add(n.value);
      if (n.options) for (const o of Object.values(n.options)) walk(o.value);
      if (n.children) walk(n.children);
    }
  };
  walk(ast);
  return args;
}

/**
 * next-intl kalit segmentlari uchun TAQIQLANGAN nomlar (prototip
 * ifloslanishidan himoya). Bunday kalit bilan `next build` "Invalid message
 * id segment" bilan yiqiladi — ya'ni xato faqat build'da chiqadi. Shuning
 * uchun uni shu yerda, tez tekshiruvda ushlaymiz.
 */
const RESERVED = new Set(['prototype', 'constructor', '__proto__']);

const base = flat(dicts.uz);
console.log(`\n· Lug'at: uz ${base.size} kalit`);
for (const key of base.keys()) {
  for (const seg of key.split('.')) {
    if (RESERVED.has(seg)) fail(`Kalit segmenti TAQIQLANGAN (next-intl): ${key} — "${seg}" nomini o'zgartiring`);
  }
}
for (const locale of LOCALES.slice(1)) {
  const other = flat(dicts[locale]);
  for (const key of base.keys()) if (!other.has(key)) fail(`${locale}.json — kalit YO'Q: ${key}`);
  for (const key of other.keys()) if (!base.has(key)) fail(`${locale}.json — ortiqcha kalit: ${key}`);
  for (const [key, text] of base) {
    const otherText = other.get(key);
    if (otherText === undefined) continue;
    const a = icuArgs(text);
    const b = icuArgs(otherText);
    if (!a) { fail(`uz.json — ICU sintaksisi yaroqsiz: ${key}`); continue; }
    if (!b) { fail(`${locale}.json — ICU sintaksisi yaroqsiz: ${key}`); continue; }
    const missing = [...a].filter((x) => !b.has(x));
    const extra = [...b].filter((x) => !a.has(x));
    if (missing.length || extra.length) {
      fail(`${locale}.json — ${key}: argumentlar mos emas (yo'q: ${missing.join(',') || '—'}; ortiqcha: ${extra.join(',') || '—'})`);
    }
    if (!otherText.trim()) fail(`${locale}.json — bo'sh matn: ${key}`);
  }
}

/* ───────────────────── 2. Marshrut → namespace ────────────────────── */
const scopesSrc = fs.readFileSync(path.join(SRC, 'i18n', 'scopes.ts'), 'utf8');

function parseList(name) {
  const m = new RegExp(`export const ${name}[^=]*=\\s*\\[([\\s\\S]*?)\\]`).exec(scopesSrc);
  return m ? [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]) : [];
}
const GLOBAL = parseList('GLOBAL_CLIENT_NAMESPACES');

const scopesBlock = /export const SCOPES[^=]*=\s*\{([\s\S]*?)\n\}/.exec(scopesSrc);
const SCOPES = {};
if (scopesBlock) {
  for (const m of scopesBlock[1].matchAll(/([a-zA-Z0-9_]+)\s*:\s*\[([^\]]*)\]/g)) {
    SCOPES[m[1]] = [...m[2].matchAll(/'([^']+)'/g)].map((x) => x[1]);
  }
}

const fileCache = new Map();
const read = (f) => {
  if (!fileCache.has(f)) fileCache.set(f, fs.readFileSync(f, 'utf8'));
  return fileCache.get(f);
};

function resolveImport(spec, fromFile) {
  let p;
  if (spec.startsWith('@/')) p = path.join(SRC, spec.slice(2));
  else if (spec.startsWith('.')) p = path.resolve(path.dirname(fromFile), spec);
  else return null;
  for (const c of [p, p + '.tsx', p + '.ts', path.join(p, 'index.tsx'), path.join(p, 'index.ts')]) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

/** Fayl + u import qiladigan barcha loyiha fayllari (tranzitiv). */
const closureCache = new Map();
function closure(file, seen = new Set()) {
  if (closureCache.has(file)) {
    for (const f of closureCache.get(file)) seen.add(f);
    return seen;
  }
  if (seen.has(file)) return seen;
  seen.add(file);
  const src = read(file);
  for (const m of src.matchAll(/(?:from\s*|import\s*\(\s*)['"]([^'"]+)['"]/g)) {
    const r = resolveImport(m[1], file);
    if (r && !seen.has(r)) closure(r, seen);
  }
  return seen;
}

const isClient = (f) => /^\s*['"]use client['"]/.test(read(f));

function namespacesOf(file) {
  const out = new Set();
  for (const m of read(file).matchAll(/useTranslations\(\s*'([^']+)'/g)) out.add(m[1].split('.')[0]);
  return out;
}

/** Marshrut fayllari (page.tsx) va ularning ajdod layout'lari. */
function routes(dir = APP, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) routes(p, acc);
    else if (e.name === 'page.tsx' || e.name === 'not-found.tsx') acc.push(p);
  }
  return acc;
}

function ancestorLayouts(pageFile) {
  const out = [];
  let dir = path.dirname(pageFile);
  while (dir.startsWith(APP) || dir === APP) {
    const l = path.join(dir, 'layout.tsx');
    if (fs.existsSync(l)) out.push(l);
    if (dir === APP) break;
    dir = path.dirname(dir);
  }
  return out;
}

const rows = [];
for (const page of routes()) {
  const layouts = ancestorLayouts(page);
  // Sahifa + ajdod layout'lar closure'i (layout'lar navbar/footer'ni olib keladi)
  const files = new Set();
  for (const f of [page, ...layouts]) for (const x of closure(f)) files.add(x);

  const used = new Set();
  for (const f of files) if (isClient(f)) for (const ns of namespacesOf(f)) used.add(ns);

  // Yetkazilgan: global + ajdod layout'larda e'lon qilingan SCOPES
  const provided = new Set(GLOBAL);
  const scopeNames = [];
  for (const f of [page, ...layouts]) {
    const src = read(f);
    const names = [
      ...[...src.matchAll(/<Scope\s+name="([a-zA-Z0-9_]+)"/g)].map((m) => m[1]),
      ...[...src.matchAll(/SCOPES\.([a-zA-Z0-9_]+)/g)].map((m) => m[1]),
    ];
    for (const n of names) {
      scopeNames.push(n);
      if (!SCOPES[n]) fail(`${path.relative(ROOT, f)} — SCOPES.${n} mavjud emas`);
      for (const ns of SCOPES[n] ?? []) provided.add(ns);
    }
  }

  const missing = [...used].filter((ns) => !provided.has(ns));
  const route = '/' + path.relative(APP, path.dirname(page)).replace(/\\/g, '/');
  rows.push({ route, used: [...used].sort(), scopes: scopeNames, missing });
  if (missing.length) {
    fail(`${route} — client xabarlari yetkazilmagan: ${missing.join(', ')} ` +
         `(scopes.ts dagi SCOPES ga qo'shing va bo'lim layout'ida MessagesScope bilan bering)`);
  }
}

/* Ishlatilmayotgan scope — jim ogohlantirish emas, xato (o'lik payload) */
const usedScopes = new Set(rows.flatMap((r) => r.scopes));
for (const name of Object.keys(SCOPES)) {
  if (!usedScopes.has(name)) fail(`SCOPES.${name} hech qaysi layout'da ishlatilmayapti (o'lik payload)`);
}

if (REPORT) {
  console.log('\n· Marshrutlar:');
  for (const r of rows.sort((a, b) => a.route.localeCompare(b.route))) {
    const local = r.used.filter((ns) => !GLOBAL.includes(ns));
    console.log(`  ${r.route.padEnd(34)} [${r.scopes.join(',') || '-'}]  ${local.join(' ') || '—'}`);
  }
}

console.log(`\n· Marshrut: ${rows.length} ta tekshirildi`);
if (failed) { console.error(`\n✗ i18n tekshiruvi: ${failed} xato\n`); process.exit(1); }
console.log('✓ i18n tekshiruvi toza\n');
