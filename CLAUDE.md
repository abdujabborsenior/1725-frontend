# CLAUDE.md — MYMarkaz Frontend · iOS Design Charter

Bu fayl `mymarkaz-frontend` (Next.js 14 app router) uchun **UI/UX & dizayn
manbai**. Backend `../1725/CLAUDE.md` §8 dagi mandatning operatsion davomi.

> **2026-07-25 — TO'LIQ iOS REDIZAYN.** Foydalanuvchi talabi bilan butun mahsulot
> **Apple iOS dizayn tili**ga o'tkazildi (100% qamrov). Bu fayl o'sha tizimning
> yagona haqiqat manbai. Oldingi emerald/"premium web" charter BEKOR qilingan.

---

## 1. Stack
Next.js 14 (app router) · TypeScript · Tailwind · React Query · zustand ·
react-hot-toast. framer-motion faqat chatda (swipe-reply). Token manbai:
`tailwind.config.ts`; global uslub: `src/app/globals.css`.

## 2. iOS dizayn tili (MAJBURIY qoidalar)

### 2.1 Ranglar — Apple system palitrasi
- `tailwind.config.ts` da BARCHA rang oilalari Apple system ranglariga
  qayta yozilgan: `slate/gray/...` = Apple neytrallari (systemGray shkala,
  matn `#1D1D1F`), `accent/blue` = **systemBlue #007AFF** (yagona tint),
  `emerald/green` = systemGreen, `rose/red` = systemRed, `amber/orange` =
  systemOrange, `iris/indigo` = systemIndigo, `sky/cyan` = systemCyan,
  `violet/purple` = systemPurple. `ios.*` nomlari ham bor (`bg-ios-blue`).
- **Tint = systemBlue.** CTA, faol tab, havola, "batafsil" — hammasi accent.
  Semantik ranglar FAQAT ma'no uchun (xato=red, muvaffaqiyat=green,
  ogohlantirish=orange). Dekorativ gradient TAQIQLANADI (avatar/logo
  fallback'lari — TEKIS system rang, gradient emas).
- Kontrast: oq matn uchun `accent-600`+ (600 = #0071E3, AA), oq fondagi
  ikkilamchi matn `slate-500`+ (#6E6E73, AA).

### 2.2 Tipografiya — SF shkalasi
- Font stack (`--font-ios`): **-apple-system / SF Pro** birinchi — Apple
  qurilmalarida HAQIQIY system shrift; boshqalarda self-host Inter (§7.1).
- Tailwind'da iOS HIG o'lchamlari bor va ISHLATILISHI SHART:
  `text-large-title` (34) · `title-1` (28) · `title-2` (22) · `title-3` (20) ·
  `headline`/`body` (17) · `callout` (16) · `subhead` (15) · `footnote` (13) ·
  `caption-1` (12) · `caption-2` (11). `text-sm/xs/[11px]` yangi kodda YO'Q.
- Vazn: sarlavha `font-semibold`/`bold`; `font-black` TAQIQ. Sahifa H1 =
  `PageHeader` (large-title bold). Input/textarea matni 17px (`text-body`) —
  iPhone Safari fokus-zoom bo'lmasligi ham shundan.

### 2.3 Sirtlar, radius, soya
- Fon: `surface-soft` (#F2F2F7, systemGroupedBackground); karta = **oq,
  CHEGARASIZ** (`bg-white` + `rounded-ios-*`). `border border-slate-200`
  kartalarda ishlatilmaydi.
- Radius shkalasi: `rounded-ios` (10) · `-md` (12) · `-lg` (14) · `-xl` (16)
  · `-2xl` (20) · `-3xl` (26, sheet). Ilova-ikonka kvadratlari: 29px→7px,
  füll o'lchamda `[13px]`.
- Soyalar minimal: rest'da deyarli yo'q, hover `shadow-card-hover`, modal
  `shadow-modal`, segmented tugmasi `shadow-segment`. Glow YO'Q.
- Ajratkich: `hairline-b/t` (0.5px, scaleY) yoki `.ios-list` ichki inset
  ajratkichi — `divide-y`/`border-t` o'rniga.

### 2.4 Materiallar (translucency)
`.material-bar` (nav/tab bar) · `.material-thick` (yopishqoq panellar) ·
`.material-menu` (popover/kontekst menyu) · `.material-dark` (media ustida).
Barchasi blur+saturate. Faqat chrome/overlay uchun — kontent kartasiga emas.

### 2.5 Naqshlar (komponent lug'ati)
- **PageHeader** (`ui/page-header.tsx`) — har ichki sahifa boshi (large title
  + subtitle + o'ngda kapsula amal). `FilterChip`, `EmptyState` ham shu yerda.
- **Inset grouped list** — `.ios-list` + `.ios-row` (yoki `ui/list.tsx`
  `ListGroup/ListRow`): sozlamalar, havolalar, natijalar, bildirishnomalar.
  `--row-inset` bilan ajratkich chap chekkasi belgilanadi.
- **Segmented control** — `ui/segmented.tsx` yoki `.segmented/.segment` —
  tab almashtirish shu bilan (pill-tab emas).
- **Switch** — `ui/switch.tsx` (UISwitch, systemGreen).
- **SearchField** — `ui/search-field.tsx` (kulrang fill, ichida lupa, × tozalash).
- **Modal** — `ui/modal.tsx`: mobil = pastdan **sheet** (grabber + sudrab
  yopish), desktop = markaziy dialog. Sahifadagi popover = `.material-menu`.
- **Tugmalar**: `ui/button.tsx` (filled/gray/bordered/plain/destructive).
  Inline amallar — kapsula: `bg-accent-600 text-white` yoki `bg-fill-tertiary`.
  Orqaga = chevron + "Orqaga" tint matn (`ui/back-button.tsx`).
- **Bosish javobi**: `.tappable` (opacity) / `.tappable-scale`. Hover-lift
  (`hover:-translate-y`) TAQIQ — iOS'da element ko'tarilmaydi.
- **CTA juftligi** (hero / yakuniy chaqiruv): `.cta-fill` (to'ldirilgan tugma —
  hover'da foni to'qlashadi + rangdosh yumshoq nur; sirtga qarab
  `.cta-fill-light` navy ustidagi oq, `.cta-fill-gray` system fill) +
  `.cta-ghost` (ikkilamchi — chegara DOIM turadi, faqat hover'da rangi
  "chiqadi" → maket sakramaydi; navy ustida `.cta-ghost-dark`) va ichidagi
  `.cta-arrow` (hover'da 3px o'ngga). Hover qoidasi: har doim
  `@media (hover: hover)` ichida — sensorli ekranda holat "yopishib" qolmaydi.
- **Tab bar** (mobil): faol band TO'LDIRILGAN (`*Fill`) ikonka + tint.
- **Hero vizuali** (`landing/hero-visual.tsx`) — home hero'ning o'ng ustuni:
  stock rasm emas, MAHSULOTNING o'zi. Uch sirt (muammo chipi → Yechim AI chipi
  → startap kartasi) turli balandlikda qalashadi; chiplar kartaning faqat
  BURCHAGINI qoplaydi (logotip/sarlavha/reyting hech qachon berkilmaydi).
  Rasm fayli yo'q — DOM + tokenlar (retina'da aniq, tarmoq so'rovi 0, LCP
  h1 matnida qoladi). **Mobilda ham uchala qatlam ko'rinadi** (2026-08-28):
  kengliklar FOIZDA (karta 60% · muammo 53% · AI chipi 42% — yig'indisi
  100% dan kam, ya'ni chip o'ng qirrasi kartaning 16px chekinishidan chapda
  qoladi), matn qisqargan variant bilan. Qat'iy px kengliklar 360px'da
  reyting qatorini qoplab qo'yardi. Kanvas balandligi o'zgarmadi.
- **AI kirish nuqtasi** (`ai/ai-launcher.tsx`) — home'dagi Yechim AI moduli:
  chapda NIMA ekani (marka + sarlavha + bir jumla), o'ngda NIMA QILISH kerakligi
  (maydon + tez savollar). Ikki ustun faqat `lg`dan (768px'da sarlavha ustuni
  siqilib ketadi). **O'lcham intizomi**: kirish maydoni HECH QACHON konteyner
  kengligiga cho'zilmaydi — `max-w-[26rem]` + balandligi `/ai` composeri bilan
  bir xil (52px pill, 40px boshqaruvlar). Bir mahsulotda bitta boshqaruv ikki
  xil o'lchamda bo'lmaydi; cho'zilgan maydon boshqaruv emas, "tarnov" bo'lib
  ko'rinadi. Tinch nur — `.ai-aura-idle` KLASSI (inline `style` bilan
  `--ai-glow` berilsa `:focus-within` uni bosa olmaydi → maydon fokusda
  jonlanmay qoladi). O'zbekcha maydonlarda `spellCheck={false}` (brauzer
  lug'ati yo'q — qizil to'lqin butun matnni "xato" ko'rsatadi).

### 2.6 Ikonografiya — Ionicons (iOS to'plami)
- Manba: **Ionicons 8** (MIT, iOS uchun chizilgan) → `npm run icons:gen`
  (`scripts/gen-icons.js`) → `src/components/icons/*.tsx` (inline SVG,
  tree-shaking: next.config `modularizeImports`). lucide-react O'CHIRILGAN.
- Nomlar lucide-mos (Bell, Trash2, ...) + `*Fill` variantlar (faol holat).
  `Spinner` = iOS activity indicator (12 tayoqcha). Yangi ikonka kerak bo'lsa —
  generator MAP'iga qo'shib qayta generatsiya qilinadi; qo'lda SVG yozilmaydi.
- Emoji va o'zboshimcha belgi UI'da TAQIQ.

### 2.7 Motion
- Easing: `ease-ios` = cubic-bezier(0.32,0.72,0,1); micro 150ms, kirish
  250–350ms, sheet 420ms. Animatsiyalar: `animate-sheet-up/alert-in/scale-in/
  msg-in`. Cheksiz dekor animatsiya TAQIQ; `prefers-reduced-motion` hurmatda.

### 2.8 Chat = iMessage
Pufaklar: chiquvchi `bubble-out` (#007AFF) + `bubble-tail-out`, kiruvchi
`bubble-in` (#E9E9EB) + `bubble-tail-in`, radius 18px. Yuborish = doira ichida
yuqoriga strelka (`ArrowUp`, h-8 w-8). Composer kapsulasi oq, header/footer
`.material-bar`. Kontekst menyu `.material-menu`.

## 3. Taqiqlar (qisqa ro'yxat)
❌ Gradient fon/matn/avatar (brend logosidan tashqari) · ❌ glow soyalar ·
❌ hover-lift · ❌ `font-black` · ❌ KATTA HARFLI eyebrow-pill'lar (faqat
`.ios-section-header` yoki kichik tint eyebrow) · ❌ `border` bilan karta ·
❌ px-based `text-[..px]` · ❌ emoji-ikonka · ❌ lucide-react.

## 4. Buyruqlar
```bash
npm run dev        # localhost:3330
npm run build      # har o'zgarishdan keyin TOZA bo'lsin
npm run lint
npm run icons:gen  # Ionicons'dan iOS ikonka to'plamini qayta generatsiya
```

## 5. Verifikatsiya usuli
`npm run dev` (bg) + puppeteer-core skript (scratchpad `shoot.js` naqshi):
barcha marshrutlar desktop 1440 + mobil 390 (auth token bilan), gorizontal
overflow tekshiruvi. Har katta o'zgarishdan keyin build + lint + vizual.

## 6. Progress
- [x] 2026-07-25 — To'liq iOS redizayn: foundation (token/CSS), 186 ikonka
  (Ionicons), primitivlar (button/input/select/modal-sheet/segmented/switch/
  list/search), chrome (navbar/tab-bar/footer/spotlight/bell/toast), barcha
  sahifalar (home, startups CRUD + LinkFields, problems, solutions, polls,
  leaderboard, discover, profile, settings, notifications, auth, chat=iMessage,
  404). Build + lint toza; 18 marshrut × 2 viewport vizual tekshirildi.
- [x] 2026-07-25 (2-to'lqin) — Karta tizimi (`.card-today`/`.cover-zoom`/
  `.grid-rise`), kattaroq startap kartasi, kategoriya rangi, iOS profil.
- [x] 2026-07-25 (3-to'lqin, YAKUNIY QAMROV) — qoldiq eski shkala (86 ta
  `text-xs/sm/...`) iOS ramkasiga; sana tili (§8); poll kartasi iOS picker;
  kategoriya rangi hash bilan 100% qamrov; muqova "raketa" zaxirasi olib
  tashlandi; logotip hamma joyda `StartupLogo`; izohdagi "+ Qo'shish" havola
  oqimi oddiy maydonga; `btn-lift`/hover-lift/CAPS yorliq/chegarali karta/CTA
  strelkalari tozalandi; `/settings` mobil overflow tuzatildi. Build+lint toza,
  20×desktop + 16×mobil skrinshot, overflow 0.
- [ ] Admin panel (`../admin-panel-front`) — hali eski tilda (alohida vazifa).

## 7. Performance tizimi (2026-07-07 — REGRESS QILMA)

1. **Font**: Inter self-host — lotin subset `globals.css` ichida base64,
   metrik-mos `Inter Fallback` + `font-display: optional`. Google Fonts YO'Q.
   (iOS qurilmalar -apple-system ishlatadi — Inter faqat boshqa platformalar.)
2. **LCP**: sahifa root'iga fade YO'Q; LCP element opacity-0 dan boshlanmaydi
   (`.hero-enter-x` faqat transform).
3. **Reveal**: `landing/reveal.tsx` (CSS+IO). framer faqat chatda.
4. **SSR initial data**: public sahifalar `fetchInitial` → `initialData`
   (+`initialDataUpdatedAt: 0`); LCP rasmga `preload(fetchPriority: high)`.
5. **Rasmlar**: list'da birinchi 1–2 karta `priority`, qolgani lazy.
6. **Kontrast AA**: §2.1 qiymatlari; `opacity-*` bilan matn xiralashtirish taqiq.
7. **Home**: below-fold `LazySection` + `next/dynamic` + `cv-auto`.
8. Above-fold'da cheksiz animatsiya taqiq.

## 8. Sana/vaqt (i18n — MAJBURIY)
`date-fns` TO'G'RIDAN chaqirilmaydi (locale'siz "1 day ago" kabi inglizcha matn
beradi — §9 buzilishi). Yagona manba: **`src/lib/date.ts`** —
`timeAgo` (qo'shimchali, "3 kun oldin") · `timeAgoShort` (chat ro'yxati, "3 kun") ·
`formatDate` · `formatTime`. Til qo'shilganda locale FAQAT shu faylda almashadi.

## 9. Demo/seed ma'lumot qoidasi
Avatar/logotip uchun tashqi generator (dicebear, pravatar) ISHLATILMAYDI —
ular gradientli rasm qaytaradi (dizayn tiliga zid) va tashqi bog'liqlik tug'diradi.
Seed logotipni `null` qoldiradi; ilova o'zi tekis iOS "app icon" (bosh harflar +
barqaror system rang) chizadi: `StartupLogo` (startap) / `Avatar` (odam, guruh).
