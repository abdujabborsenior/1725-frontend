#!/usr/bin/env node
/**
 * Ulashish rasmlarini (Open Graph, 1200×630) yasaydi — HAR TIL uchun bittadan:
 * `public/og/og-{uz,ru,en}.png`.
 *
 * Nega build vaqtida `next/og` emas: satori WOFF2 ni o'qimaydi (bizda Inter
 * faqat WOFF2), qolaversa har build'da uch rasm qayta chizilardi. Bu skript
 * QO'LDA yuritiladi (`npm run og:gen`), natija statik fayl — brauzerga
 * CDN'dan keladi, ilova yuki nol.
 *
 * Talab: tizimda `google-chrome` (faqat ishlab chiqish mashinasida).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'og');

const COPY = {
  uz: { title: "G'oyadan biznes loyihagacha", flow: 'Muammo → Yechim → Startap', kicker: 'Startap platformasi' },
  ru: { title: 'От идеи до бизнес-проекта', flow: 'Проблема → Решение → Стартап', kicker: 'Стартап-платформа' },
  en: { title: 'From Idea to Business', flow: 'Problem → Solution → Startup', kicker: 'Startup platform' },
};

const SEG = (deg, fill) =>
  `<path d="M46.93 28.22L38.14 7L61.86 7L53.07 28.22Z"${deg ? ` transform="rotate(${deg} 50 50)"` : ''} fill="${fill}" stroke="${fill}" stroke-width="6" stroke-linejoin="round"/>`;
const MARK = `<svg viewBox="0 0 100 100" width="96" height="96">
  ${SEG(0, '#74ABD8')}${SEG(45, '#578EBE')}${SEG(90, '#3D6F9E')}${SEG(135, '#2A527E')}
  ${SEG(180, '#1C3B60')}${SEG(225, '#2A527E')}${SEG(270, '#3D6F9E')}${SEG(315, '#578EBE')}
  <circle cx="50" cy="50" r="11" fill="#0A192F"/></svg>`;

const html = (locale) => {
  const c = COPY[locale];
  // Inter WOFF2 — Chrome o'qiydi; kirill uchun alohida subset
  const font = (f) => `url(file://${path.join(ROOT, 'public', 'fonts', f)}) format('woff2')`;
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><style>
  @font-face{font-family:Inter;font-weight:100 900;src:${font('inter-var-latin.woff2')};unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+2018-201A,U+2122,U+2192;}
  @font-face{font-family:Inter;font-weight:100 900;src:${font('inter-var-latin-ext.woff2')};unicode-range:U+0100-024F,U+2C60-2C7F,U+A720-A7FF;}
  @font-face{font-family:Inter;font-weight:100 900;src:${font('inter-var-cyrillic.woff2')};unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116;}
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;font-family:Inter,system-ui,sans-serif;color:#fff;overflow:hidden;
    background:radial-gradient(120% 100% at 12% 0%,#1C3B60 0%,#0A192F 62%,#060F1E 100%);}
  .surface{position:absolute;inset:0;background:
    radial-gradient(70% 90% at 12% 0%,rgba(116,171,216,.28),transparent 62%),
    radial-gradient(60% 80% at 92% 100%,rgba(0,113,227,.22),transparent 60%),
    linear-gradient(160deg,#0A192F 0%,#102A4C 55%,#081527 100%);}
  .edge{position:absolute;inset-inline:0;top:0;height:6px;
    background:linear-gradient(90deg,#74ABD8,#0071E3 45%,#1C3B60);}
  .wrap{position:relative;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 88px;gap:30px}
  .brand{display:flex;align-items:center;gap:22px}
  .plate{width:120px;height:120px;border-radius:30px;background:#fff;display:flex;align-items:center;justify-content:center;
    box-shadow:0 18px 48px rgba(0,0,0,.35)}
  .word{font-size:52px;font-weight:700;letter-spacing:-.02em}
  .word span{color:#74ABD8}
  .kicker{font-size:24px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#74ABD8}
  h1{font-size:${locale === 'ru' ? 66 : 72}px;line-height:1.08;font-weight:700;letter-spacing:-.025em;max-width:960px}
  .flow{display:inline-flex;align-items:center;gap:14px;font-size:28px;font-weight:600;color:#DCE8F5;
    background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);border-radius:999px;padding:14px 28px;align-self:flex-start}
  .foot{position:absolute;left:88px;bottom:56px;font-size:26px;font-weight:600;color:rgba(255,255,255,.72)}
  </style></head><body><div class="surface"></div><div class="edge"></div>
  <div class="wrap">
    <div class="brand"><div class="plate">${MARK}</div>
      <div><div class="kicker">${c.kicker}</div><div class="word">MY<span>Markaz</span></div></div></div>
    <h1>${c.title}</h1>
    <div class="flow">${c.flow}</div>
  </div><div class="foot">mymarkaz.uz</div></body></html>`;
};

fs.mkdirSync(OUT, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'og-'));
for (const locale of Object.keys(COPY)) {
  const file = path.join(tmp, `${locale}.html`);
  fs.writeFileSync(file, html(locale));
  const out = path.join(OUT, `og-${locale}.png`);
  execFileSync('google-chrome', [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--force-device-scale-factor=1', '--window-size=1200,630',
    `--screenshot=${out}`, `file://${file}`,
  ], { stdio: 'ignore' });
  console.log('✓', path.relative(ROOT, out), (fs.statSync(out).size / 1024).toFixed(0) + ' KB');
}
fs.rmSync(tmp, { recursive: true, force: true });

/* ── PWA ikonkalari (192/512 + maskable) ─────────────────────────────
   Manifest uchun PNG shart (SVG'ni hamma platforma qabul qilmaydi).
   Maskable variant — belgi xavfsiz doira ichida (Android uni kesadi). */
const ICONS = [
  { file: 'icon-192.png', size: 192, pad: 0.12, bg: '#ffffff' },
  { file: 'icon-512.png', size: 512, pad: 0.12, bg: '#ffffff' },
  { file: 'icon-maskable-512.png', size: 512, pad: 0.22, bg: '#ffffff' },
  { file: 'apple-icon.png', size: 180, pad: 0.12, bg: '#ffffff' },
];
const ICON_OUT = path.join(ROOT, 'public', 'icons');
fs.mkdirSync(ICON_OUT, { recursive: true });
const tmp2 = fs.mkdtempSync(path.join(os.tmpdir(), 'icon-'));
for (const ic of ICONS) {
  const inner = Math.round(ic.size * (1 - ic.pad * 2));
  const file = path.join(tmp2, ic.file + '.html');
  fs.writeFileSync(
    file,
    `<!doctype html><meta charset="utf-8"><style>*{margin:0;padding:0}
     body{width:${ic.size}px;height:${ic.size}px;background:${ic.bg};display:flex;align-items:center;justify-content:center;overflow:hidden}
     svg{width:${inner}px;height:${inner}px}</style>${MARK}`,
  );
  const out = ic.file === 'apple-icon.png' ? path.join(ROOT, 'public', ic.file) : path.join(ICON_OUT, ic.file);
  execFileSync('google-chrome', [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--force-device-scale-factor=1', `--window-size=${ic.size},${ic.size}`,
    `--screenshot=${out}`, `file://${file}`,
  ], { stdio: 'ignore' });
  console.log('✓', path.relative(ROOT, out), (fs.statSync(out).size / 1024).toFixed(1) + ' KB');
}
fs.rmSync(tmp2, { recursive: true, force: true });
