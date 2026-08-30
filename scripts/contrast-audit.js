/**
 * Kontrast auditori — brauzerda ishlaydigan SNIPPET (bog'liqliksiz).
 *
 * Nima qiladi: sahifadagi HAR bir matnli element uchun haqiqiy matn rangini va
 * ALFA aralashtirilgan haqiqiy fonni topadi, WCAG kontrast nisbatini hisoblaydi
 * va chegaradan past bo'lganlarini qaytaradi (oddiy matn 4.5:1, katta matn 3:1).
 *
 * Ishlatish:
 *   1) DevTools konsoliga to'liq faylni joylashtiring (`copy(...)` kerak emas), yoki
 *   2) CDP/puppeteer'da `page.evaluate(fs.readFileSync('scripts/contrast-audit.js','utf8'))`.
 *
 * Ma'lum YOLG'ON POZITIVLAR (charter §2.9.2): faol kapsulasi AKA-UKA element
 * bilan chizilgan segmented control va `paint-order: stroke` halo'li SVG yorliq —
 * auditor ularning haqiqiy fonini ko'ra olmaydi.
 */
(() => {
  function parse(c) {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(',').map((x) => parseFloat(x));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  function over(fg, bg) { // alfa aralashtirish
    const a = fg.a;
    return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
  }
  function lum(c) {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function ratio(a, b) {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }
  function bgOf(el) {
    let cur = el, acc = null;
    while (cur && cur !== document.documentElement) {
      const cs = getComputedStyle(cur);
      const bg = parse(cs.backgroundColor);
      if (bg && bg.a > 0) {
        acc = acc ? over(acc, bg) : bg;
        if (acc.a >= 0.999) return acc;
      }
      // gradient/rasm bo'lsa — ishonchsiz, o'tkazib yuboramiz
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;
      cur = cur.parentElement;
    }
    return acc && acc.a >= 0.999 ? acc : { r: 255, g: 255, b: 255, a: 1 };
  }
  const out = [];
  const seen = new Set();
  document.querySelectorAll('*').forEach((el) => {
    const own = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3 && n.textContent.trim())
      .map((n) => n.textContent.trim()).join(' ');
    if (!own || own.length < 2) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.3) return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    const fgRaw = parse(cs.color);
    const bg = bgOf(el);
    if (!fgRaw || !bg) return;
    const fg = over(fgRaw, bg);
    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    const cr = ratio(fg, bg);
    if (cr < need) {
      const key = cs.color + '|' + own.slice(0, 30);
      if (seen.has(key)) return;
      seen.add(key);
      out.push({
        text: own.slice(0, 42),
        color: cs.color,
        bg: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`,
        px: size, w: weight,
        ratio: Math.round(cr * 100) / 100,
        need,
        cls: (el.className && el.className.baseVal !== undefined ? el.className.baseVal : String(el.className || '')).slice(0, 90),
      });
    }
  });
  return out.sort((a, b) => a.ratio - b.ratio).slice(0, 14);
})()
