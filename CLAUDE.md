# CLAUDE.md — MYMarkaz Frontend · Design Charter

Bu fayl `mymarkaz-frontend` (Next.js 14 app router) uchun **UI/UX & dizayn
manbai**. Backend `../1725/CLAUDE.md` §8 dagi mandatning operatsion davomi.
Maqsad: butun mahsulotni **Apple / Linear / Google darajasidagi premium, silliq**
holatga keltirish — **restraint** (kamroq, lekin mukammal), izchillik va sayqal
bilan. Har o'zgarish faqat **vizual**: funksionallik, proplar, ma'lumot oqimi buzilmaydi.

> **Oltin qoida:** Premium = restraint. Har element o'z o'rnini oqlashi kerak.
> Shubha bo'lsa — **olib tashla**, qo'shma. Signature elementlar kam, lekin maxsus.

---

## 1. Stack
Next.js 14 (app router) · TypeScript · Tailwind · framer-motion · lucide-react ·
React Query · zustand · react-hot-toast. Ranglar/token: `tailwind.config.ts`,
global uslub: `src/app/globals.css`.

## 2. Dizayn tili (qarorlar — MAJBURIY)

### 2.1 Rang intizomi
- **Emerald (`accent`)** — YAGONA asosiy harakat/brend rangi (CTA, faol holat, live).
- **Iris (indigo)** — KAMDAN-KAM ikkilamchi urg'u: faqat chat va bitta signature
  gradient. Hamma joyga sepilmaydi.
- **Neytrallar (`slate`/`brand`)** — interfeysning 90%i: fon, matn, chegara, sirt.
- **Semantik**: amber=ogohlantirish/kutish, rose=xato/danger, sky/violet=status.
  Bular faqat **status** uchun — dekor sifatida emas.
- **Signature gradient** `gradient-emerald-iris` — faqat 3 joyda ruxsat: (a) logo
  belgisi, (b) hero'dagi bitta kalit so'z, (c) asosiy CTA hover shine. Boshqa hamma
  joyda (section underline, FAQ tugma, card glow, bottom-nav indikator) — olib
  tashlanadi yoki solid `accent`ga almashtiriladi.

### 2.2 Tipografiya
- Shrift: Inter. Tracking sarlavhalarда `tracking-tight`.
- **`font-black` faqat**: hero H1 va yirik raqamlar (stat/CountUp). Boshqa hamma
  sarlavhalar `font-bold`/`font-semibold`. "Shouty" black ko'plikdan qochiladi.
- Type scale (barqaror): H1 `text-4xl→7xl`, H2 `text-2xl→3xl`, H3 `text-lg→xl`,
  body `text-[15px]/text-base`, meta `text-xs/text-[11px]`. Matn rangi `text-slate-600`
  (body), `text-brand-900` (sarlavha), `text-slate-500/400` (meta).

### 2.3 Spacing & layout ritmi
- Sahifa bo'limlari orasi: `space-y-16 md:space-y-24` (landing), ichki `space-y-6`.
- Card padding: kichik `p-4`, standart `p-5`, katta `p-6/p-7`. Ixtiyoriy emas —
  shu shkaladan tanlanadi.
- Radius: interaktiv `rounded-xl`, card `rounded-2xl`, katta blok `rounded-3xl`,
  hero/CTA `rounded-[2rem]`. Pill `rounded-full`.
- Konteyner: `max-w-6xl` (asosiy), matn bloki `max-w-2xl/3xl`.

### 2.4 Chegara, sirt, soya
- Chegara: `border-slate-200` (default), hover `border-slate-300` yoki `accent-300`.
- Soya: `shadow-card` (rest) → `shadow-card-hover` (hover). Glow (`glow-accent`)
  faqat CTA/logo. Ortiqcha soya yo'q — tekis, tinch.
- Sirt: oq card ustunlik qiladi; `surface-soft` fon uchun.

### 2.5 Motion (birlashtirilgan)
- **Yagona easing**: `cubic-bezier(0.22, 1, 0.36, 1)` (kirish/chiqish uchun).
- Davomiylik: micro `150ms`, kirish `200–320ms`. Undan uzun yo'q.
- **Cheksiz fon animatsiyalari kamaytiriladi**: sahifada ko'pi bilan 1–2 nozik
  harakat. Aurora blob soni kamaytiriladi, `animate-float` gimmick chiplar olib
  tashlanadi. `prefers-reduced-motion` hurmat qilinadi.
- Reveal (scroll-in) — nozik `opacity+translateY(12px)`, stagger `60ms`.

### 2.6 Iconografiya
- `lucide-react` — yagona icon manbai (emoji YO'Q, allaqachon yo'q — shunday qoladi).
- Icon o'lchami kontekstga izchil: inline meta `h-3.5`, tugma `h-4`, feature `h-5→7`.
- Stroke izchil (lucide default). Rang: neytral yoki bitta accent — rang-barang emas.
- Brand belgisi (logo) — Rocket hozircha; kelajakda loyihaga xos maxsus SVG mark.

### 2.7 Taqiqlar (de-gimmick — QILMA)
- ❌ Hero'da suzuvchi "sticker" chiplar (`FloatingChip`).
- ❌ Har bo'limда boshqa-boshqa rangli pill kicker (candy salad).
- ❌ 3+ aurora blob bitta ekranда; hamma joyda kamalak gradient.
- ❌ `font-black` ni tarqatib ishlatish.
- ❌ Maqsadsiz cheksiz animatsiya (spin/float/shine) dekor uchun.

## 3. Komponent primitivlari (izchil bo'lishi shart)
`src/components/ui/`: `button`, `input`, `textarea`, `select`, `badge`, `avatar`,
`modal`, `pagination`, `otp-input`, `back-button`, `image-upload`.
- Barcha interaktiv element bir xil focus-ring (`ring-accent-500/40`), radius,
  disabled holati, transition (`150ms`).
- Yangi vizual naqsh kerak bo'lsa — avval primitivдa hal qilinadi, keyin sahifada.

## 4. Ijro tartibi (bosqichlar) — har biri: build/lint toza, funksiya buzilmaydi
1. **Foundation** — `tailwind.config.ts` + `globals.css`: motion tokenlarini
   birlashtirish, mesh/aurona intensivligini kamaytirish, signature gradient qamrovini
   toraytirish. Mavjud class nomlari saqlanadi (hech narsa sinmasin).
2. **Global chrome** — `layout` (main/auth), `navbar`, `footer`, `bottom-nav`. Har
   sahifada ko'rinadi → eng katta "feel" ta'siri.
3. **Homepage** (`(main)/page.tsx` + `landing/*`) — gimmick olib tashlash, hero
   sokinlashtirish, bo'lim ritmini tenglashtirish. (Foydalanuvchi aynan shu sahifani
   muammoli deb belgiladi.)
4. **Core primitivlar** — `ui/*` sayqal (button/input/badge/modal/...).
5. **Sahifama-sahifa** — startups (list/detail/create), problems, solutions,
   leaderboard, polls, discover, profil & `u/[username]`, messages/chat, notifications,
   settings, auth (login/register/forgot/reset/verify), not-found, bo'sh/xato holatlar.
6. **Admin panel** (`../admin-panel-front`) — xuddi shu til bilan.

## 5. Buyruqlar
```bash
npm run dev      # localhost:3330
npm run build    # har o'zgarishdan keyin TOZA bo'lsin
npm run lint     # eslint
```

## 6. Progress jurnali (har bosqichdан keyin belgilanadi)
- [x] 1. Foundation — `(main)/layout` mesh opacity 70→40 (tinch fon); hero motion easing
      `[0.22,1,0.36,1]` ga birlashtirildi. (tailwind/globals tokenlariga tegilmadi —
      allaqachon yaxshi; faqat qamrov/usage kamaytirildi.)
- [x] 2. Global chrome — navbar faol underline & bottom-nav indikator `gradient-emerald-iris`
      → solid `accent-500` (restraint). Logo mark signature gradient qoldi.
- [x] 3. Homepage + landing — **stikerlar** (`FloatingChip` suzuvchi chiplar) OLIB TASHLANDI;
      hero aurora 3→2 va animatsiyasiz sokin glow; barcha kicker'lar yagona `<Kicker>` ga
      birlashtirildi (candy-rang yo'q); feature/step icon chip → `bg-brand-900 text-accent-400`
      (unifikatsiya); H2 `font-black`→`font-bold`; "Startapper" gradient→solid accent;
      CTA blob animatsiyasiz. Hero H1 (animated gradient keyword) signature sifatida qoldi.
- [x] 4. Core UI primitivlar — TEKSHIRILDI, o'zgarish shart emas: button/input/select/textarea/
      modal/pagination allaqachon izchil (bir xil radius/focus-ring/border/transition). Churn yo'q.
- [x] 4b. **GLOBAL TIPOGRAFIYA TIZIMI** (`globals.css`) — butun loyihadagi HAR bir yozuvga
      izchil sayqal: `@layer base` da `h1–h4` → `text-wrap: balance` + premium tracking
      (-0.021em) + default brand-900 rang; `h5,h6` balance; `p,li` → `text-wrap: pretty`
      (orphan yo'q). Body: nozik `letter-spacing: -0.006em` + kengaytirilgan Inter OpenType
      (`cv02–cv04,cv11,ss01`). **Font stack sayqali**: `--font-inter` = Inter → SF Pro Text →
      -apple-system → Segoe UI → Roboto (Inter yuklanmasa ham har platformada premium fallback).
      Mobile+desktop responsiv (mavjud `md:` shkalasi saqlandi).
- [x] 5. Type intizomi — prose sahifa H1'lari `font-black`→`font-bold`+`tracking-tight`
      (problems, problems/create, problems/[id], leaderboard, startups, startups/[id],
      discover, polls, u/[handle], auth-shell). `font-black` faqat landing hero, 404, logo,
      raqamlarда. **VIZUAL ITERATSIYA**: Chrome headless (`/usr/bin/google-chrome`) + `next dev`
      bilan homepage/login/register/startups/leaderboard desktop+mobil ko'rildi va tasdiqlandi —
      navbar "Ovoz berish" 2-qatorga sinishi TUZATILDI (`whitespace-nowrap`); tipografiya
      premium ko'rinadi. ⏭ QOLGAN: data-bog'liq sahifalar (chat/profil/settings/notif) real
      ma'lumot bilan chuqur sayqal — backend ishga tushganда iteratsiya.
- [ ] 6. Admin panel

> Har bosqichdан keyin `npm run build` TOZA (tasdiqlandi: 2026-07-01 — kompilyatsiya + lint +
> typecheck, 24 marshrut).
> **Vizual verifikatsiya usuli:** `npm run dev` (bg) + `google-chrome --headless=new --no-sandbox
> --screenshot=... --window-size=W,H URL` (desktop 1440, mobil 390) → screenshotни o'qib iteratsiya.

> Eslatma: dizayn qarorlari yoki foydalanuvchi yangi direktivasi kelsa — backend
> `../1725/CLAUDE.md` §8.3 jurnaliga va bu faylga (kerakli bo'limga) yoziladi.

## 7. Performance tizimi (2026-07-07 — Lighthouse optimizatsiyasi, REGRESS QILMA)

Butun front Lighthouse bo'yicha optimallashtirilgan: **desktop 4×100, mobil perf 92–98 +
a11y/bp/seo 100**. Buzmaslik uchun MAJBURIY qoidalar:

1. **Font**: Inter self-host — lotin subset `globals.css` ichida base64 (so'rov yo'q),
   metrik-mos `Inter Fallback` (size-adjust) + `font-display: optional` → swap reflow yo'q.
   Google Fonts linki QAYTARILMAYDI; yangi og'irlik/subset kerak bo'lsa shu tizimga qo'shiladi.
2. **LCP qoidasi**: sahifa root konteyneriga `animate-fade-in` QO'YILMAYDI; LCP bo'la
   oladigan element (hero H1/P, ro'yxat kartasi, cover) opacity-0 dan BOSHLANMAYDI.
   Kirish harakati faqat mayda elementlarda (`.hero-enter`) yoki below-fold (`.reveal`).
3. **Reveal tizimi**: framer-motion landing/list yo'lida ISHLATILMAYDI — `landing/reveal.tsx`
   (CSS + IO; Reveal/RevealGroup/RevealItem API) ishlatiladi. framer faqat chat'da qoldi.
4. **SSR initial data**: public ro'yxat/detail sahifalar server component `page.tsx` →
   `fetchInitial` (`lib/server-api.ts`, revalidate 30s, fail-open) → `<X>Client` ga
   `initialData` (+`initialDataUpdatedAt: 0`). Yangi sahifa shu naqshda quriladi.
   LCP rasm bor bo'lsa — server sahifada `preload(url, { as: 'image', fetchPriority: 'high' })`.
5. **Rasmlar**: `<img>` (CDN'dan to'g'ridan) — list'da faqat birinchi 1–2 karta
   `priority` (eager+fetchpriority=high), qolgani `loading="lazy" decoding="async"`;
   imkon qadar width/height.
6. **Kontrast (WCAG AA)**: oq matn + accent fon = kamida `accent-700`; meta matn oq
   fonda `slate-500+`, `surface-soft` fonda `slate-600+`; `opacity-*` bilan matn
   xiralashtirish taqiqlanadi.
7. **Home**: below-fold bo'limlar `LazySection` + `next/dynamic` kartalar + `cv-auto` —
   yangi bo'lim qo'shilsa shu naqsh takrorlanadi.
8. Doimiy (infinite) animatsiya above-fold'da taqiqlanadi (SI buzadi) — hero gradient statik.
