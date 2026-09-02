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
- **Maydon tizimi (MAJBURIY, 2026-08-29)** — matn kiritish sirtining YAGONA manbai
  `ui/field-styles.ts`: `FIELD_SURFACE` (oq fon + 1px `slate-200` hairline +
  `rounded-ios-md` + `input-focus` halqasi + `placeholder:text-slate-500`),
  `FIELD_SIZE.md` (48px — standart) / `.sm` (40px — zich chrome, masalan chat
  qidiruvi), `FIELD_INVALID`, `FIELD_LABEL`. Input · Textarea · Select ·
  PasswordField · SearchField va HAR QANDAY qo'lda yozilgan maydon shundan oladi —
  yangi maydon uchun class YOZILMAYDI. ⚠️ Kulrang `fill` (`.ios-search`) endi
  maydonlarda ISHLATILMAYDI: iOS'da u nav bar (oq sirt) ichida turadi, bizda esa
  sahifa foni `surface-soft` — kulrang ustidagi kulrang maydon ko'rinmay qoladi.
  Kulrang fill faqat chrome tugmasida (navbar qidiruv trigger'i). Ataylab istisno:
  AI composer/launcher (`.ai-aura`), chat composer (`.composer-field`), Spotlight
  paneli va iOS Sozlamalar qatoridagi shaffof havola maydonlari (`link-fields`) —
  ular O'Z sirtiga ega.
- **PasswordField** (`ui/password-field.tsx`) — barcha parol maydonlari (login,
  register, tiklash, sozlamalar). `autoComplete` MAJBURIY (`new-password` /
  `current-password`) — busiz brauzer parol maydoniga EMAIL to'ldiradi.
  `PASSWORD_RULES` — talablarning yagona manbai (zod sxemasi ham, ko'rsatkich ham
  shundan). `rules` propi bilan jonli chiplar: bajarilgani yashil ✓, qolgani tinch
  kulrang, maydondan chiqilgach (yoki xatoda) qizil. Parol formalarida
  `useForm({ mode: 'onChange' })` — default `onSubmit` odamni "yubor → xato ko'r"
  sikliga majburlaydi.
- **Karta = "stretched link"** (startap va muammo kartalari): karta `<Link>` ICHIGA
  o'ralmaydi — `<article class="relative">` + sarlavhadagi havolaning
  `after:absolute after:inset-0` qoplamasi. Sabab: kartadagi tugmalar (yurak,
  saqlash, video ijro) `<a>` ichida bo'lsa yaroqsiz HTML va tasodifiy navigatsiya
  beradi. Tugmalar `relative z-10` bilan qoplama USTIDA turadi.
- **Toggle tugmalari (MAJBURIY, 2026-08-29)** — yoqtirish · saqlash · foydali ·
  asoschiga ovoz · obuna: mantiq YAGONA joyda — `lib/use-toggle-action.ts`.
  Uchta narsani kafolatlaydi: (1) serverga **niyat** yuboriladi (`{liked:true}`) —
  ro'yxatlar SSR'da tokensiz kelgani uchun mijoz holati eskirgan bo'lishi mumkin,
  sof toggle'da "yoqtirish" bosilsa server BEKOR qilardi; (2) tugma so'rov davomida
  `disabled` QILINMAYDI — bosishlar navbatlanadi ("latest intent wins"), ko'rinayotgan
  holat **ref**da saqlanadi (React `state` bir tikda yangilanmaydi → 4 ta tez bosish
  1 ta o'zgarish bo'lib qolardi); (3) natija `patchEntityInQueries` bilan barcha
  keshlarga yoziladi. Mehmon → `/login?next=<joriy>`. Yangi toggle tugmasi shu
  hook'siz YOZILMAYDI.
- **Podium metallari** (`.medal-gold/.medal-silver/.medal-bronze` + `.medal-badge/
  -ring/-edge`, `globals.css`) — top-3 uchun ALOHIDA rang qatlami: mahsulot palitrasida
  `amber` = systemOrange, shuning uchun 1- va 3-o'rin bir xil chiqardi. Metal
  o'zgaruvchilari (`--m1…--m-ink`) faqat podiumda ishlatiladi. `.podium-card` hover'i
  (4px ko'tarilish + metal nur + tamg'a bo'ylab bir marta yorug'lik) — bu YAGONA
  istisno, boshqa kartalarga tarqatilmaydi.
- **`.brand-surface`** — mahsulotdagi YAGONA to'q sirt (footer + auth brend paneli).
  Rangi logotipdan: #0C2545→#08182E. Yangi to'q blok kerak bo'lsa shu klass olinadi.
- **SearchField** — `ui/search-field.tsx` (maydon tizimi sirti, ichida lupa, × tozalash).
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

### 2.9 Hover — "YORUG'LIK" tili (2026-08-30 — TO'LIQ QAYTA YOZILDI)
> **Bosh qoida: hover HECH QACHON xiralashtirmaydi.** Kursor ostida sirt
> YORISHADI, brend tinti ko'tariladi, ink to'qlashadi. Eski (2026-08-29)
> zaxira `opacity: .68` / `filter: brightness(.94)` bilan ishlar edi — u
> boshqaruvni "o'chirib" qo'yardi va butun mahsulotga arzon ko'rinish berardi.
> Ikkinchi qoida o'z kuchida: kursor ostidagi HAR BIR boshqaruv javob berishi
> shart, lekin hover FAQAT kursorli qurilmada (sensorli ekranda "yopishmaydi").

**Zaxira qatlam** (`globals.css`, `.tappable`/`.tappable-scale`/`.btn-lift`,
hammasi `:where()` ichida → spetsifikatsiya past, `:active` doim ustun):
1. fonsiz boshqaruv → ink `--hv-ink` ga to'qlashadi;
2. + radiusi bor → orqasida **brend tinti plate** (`--hv-tint`) — kulrang emas;
3. foni bor (`bg-*`/`gradient-*`) → yumshoq nur (`--hv-shadow`) + `brightness(1.03)`
   (QORAYTIRISH TAQIQ: to'ldirilgan tugma fonini ochirish ham mumkin emas —
   oq yorliq AA kontrastdan chiqib ketadi, shuning uchun javob NUR bilan beriladi).

**Primitivlar** (komponentlarda ataylab qo'llanadi, har biri ma'no tashiydi):

| Klass | Qayerda | Nima qiladi |
|---|---|---|
| `.hv-row` | menyu/ro'yxat qatori | tint fon + chap qirradan o'sib chiqadigan 3px accent RELS + ink to'qlashadi |
| `.hv-pop` | ikonka/ixcham boshqaruv | tint plate + glyph 1.09× kattaradi |
| `.hv-tile` | kvadrat bosiladigan blok | tint + rangdosh nur |
| `.hv-sheen` | to'ldirilgan CTA, faol chip | sirt bo'ylab BIR MARTA specular yorug'lik (0.9s) |
| `.hv-link` | matnli havola | pastki chiziq chapdan o'ngga O'SIB chiqadi (`hover:underline` TAQIQ) |
| `.hv-avatar` | avatar havolasi | 1.06× + brend halqasi (`hover:opacity-*` TAQIQ) |
| `.hv-media` | bosiladigan rasm/muqova | rasm 1.04× + soya (xiralashtirish TAQIQ) |
| `.hv-arrow` | havoladagi strelka | 3px o'ngga siljiydi |
| `.hv-heart` / `.hv-bulb` | yoqtirish / "Foydali" | belgi 1.12–1.14× (bosishdan oldingi issiqlik ishorasi) |
| `.hv-logo` | brend belgisi | belgi 1.07× (yozuv qimirlamaydi) |
| `.ios-chevron` | oshkor qilish chevroni | qator hover'ida rangga kiradi + 2px siljiydi |
| `.nav-pill` | navigatsiya (signature) | faol band ostidagi kapsula kursor bandiga SIRPANIB boradi, kursor chiqsa qaytadi |

- **`.card-today`** (karta): ko'tarilish + soyaga **brend halqasi** qo'shildi va
  `.card-title` hover'da tint rangiga kiradi ("bu karta bosiladi").
- **Ko'tarilish (lift) hamon TAQIQ** — nur/tint/halqa bilan javob beriladi
  (istisno: `.podium-card` — o'zining metal tili bor).
- Har bir primitiv `prefers-reduced-motion: reduce` da harakatini o'chiradi.
- **Tekshirish**: `hover-audit.mjs` (scratchpad) — HAQIQIY sichqoncha bilan
  (`Input.dispatchMouseEvent`), chunki **`CSS.forcePseudoState` `getComputedStyle`
  natijasiga ta'sir QILMAYDI** va React'ning `onPointerEnter`'ini ham ishga
  tushirmaydi. Element + 5 pog'ona ota + aka-uka + ichki daraxt + `::before/::after`
  imzosi solishtiriladi; natija **DIM 0 · DEAD 0** bo'lishi shart.
  Headless Chrome'da kursor emulyatsiyasi uchun `--blink-settings=primaryHoverType=2,
  availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4` SHART.

### 2.9.1 Kulrang siyosati (2026-08-30)
Kulrang — **neytral/inert** ma'nosi. U QAYERDA QOLADI va qayerda YO'Q:

- ✅ **Qoladi**: ikkilamchi matn (`slate-500`), hairline/ajratkich, sahifa foni
  (`surface-soft`), skeleton va rasm zaxira sirti, progress treki, `disabled`,
  neytral status chipi ("So'ralmagan"), segmented control TREKI, iOS'ning
  kanonik kulrang ikonka kvadrati (masalan Sozlamalar tishli g'ildiragi).
- ❌ **Qolmaydi** (brend tinti yoki semantik rang bilan almashtiriladi):
  1. **holat/identifikatsiya** — faol nav bandi, joriy sahifa, tanlangan variant,
     tanlangan segment yorlig'i (`--hv-tint-ink`), joriy sahifalash raqami;
  2. **hover** — kulrangdan kulrangga o'tish TAQIQ (`hover:bg-fill-*`,
     `hover:text-brand-900` naqshlari olib tashlandi);
  3. **brend/semantik ikonka konteyneri** — `bg-accent-50 + text-accent-600`;
  4. **bo'sh holat belgisi** — `slate-300` "yarim o'chgan" ko'rinardi → tinted
     kvadrat (`EmptyState`) yoki `accent-300`;
  5. **kategoriya chipi** — `lib/category-tint.ts` (YAGONA manba: startap va
     muammo kartalari bitta sohani bitta rangda ko'rsatadi);
  6. **takrorlanuvchi chip/tugma** (filtrlar, "Foydali") — kulrang plomba
     o'rniga **oq sirt + hairline**: 10-15 dona yonma-yon turganda kulrang
     plombalar butun ekranni kulrang qilib ko'rsatardi.

### 2.9.2 Kontrast — O'LCHOV bilan (2026-08-30, MAJBURIY)
"Kulrang chiroyli ko'rinadi" degan tuyg'u yetarli emas — kontrast **o'lchanadi**.
Qoida: oddiy matn ≥ **4.5:1**, katta matn (≥24px yoki ≥18.7px bold) ≥ **3:1**;
fon ALFA aralashmasi bilan hisoblanadi (`bg-white/70` kulrang maydon ustida —
oq emas).

Amaliy chegaralar (palitradan, oq sirtda tekshirilgan):
- **oq matn rangli fonda** — `accent-500` (#007AFF) atigi **4.02:1**, ya'ni
  YETMAYDI. To'ldirilgan tugma/badge/avatar → kamida `*-600`
  (accent-600 4.70 · emerald-700 · amber-700 · rose-600).
- **kulrang matn** — `slate-400` (#8E8E93) faqat DEKORATIV ikonka uchun; matn
  (11px vaqt, izoh, hisoblagich, placeholder) hech qachon `slate-400` emas →
  `slate-500`; kulrang sirt (`surface-soft`, `fill-*`) ustida esa `slate-600`.
- **`slate-300`** — faqat iOS disclosure chevron (`.ios-chevron`) va hairline.
  Bo'sh holat belgisi, spinner, affordans strelkasi uchun MUMKIN EMAS.

Tekshirish: **`scripts/contrast-audit.js`** — bog'liqliksiz brauzer snippeti
(DevTools konsoliga joylashtiriladi yoki CDP/puppeteer'da `evaluate` bilan
yuritiladi); har marshrutda barcha matnli elementlarni o'lchaydi. Yangi ekran
qo'shilganda shu audit yuritiladi.
**Ma'lum yolg'on pozitivlar**: (1) faol kapsulasi AKA-UKA element bo'lgan
segmented control; (2) `paint-order: stroke` halo bilan chizilgan SVG yorliq —
auditor bularning haqiqiy fonini ko'ra olmaydi.

### 2.10 Punktuatsiya — display matn (2026-08-29)
- **Sarlavha, subtitle, karta sarlavhasi, bo'sh holat matni, tugma/chip yorlig'i,
  ro'yxat qatori — BIR JUMLA bo'lsa yakuniy nuqta QO'YILMAYDI.**
  ("Bittasi ham emas" · "Shuning uchun eng to'g'ri kun — bugun")
- **Ko'p jumlali izoh/paragraf** — punktuatsiya saqlanadi (aks holda oxirgi
  jumla "kesilgan" bo'lib ko'rinadi). Forma hint'lari ham to'liq jumla sifatida
  nuqtali qoladi.
- Savol belgisi va ellipsis (`...`) bu qoidaga kirmaydi.

### 2.11 Yechim AI — "Studio" (2026-09-02, TO'Q SIRT ISTISNOSI)

`/ai` va bosh sahifadagi AI banneri butun mahsulotdagi YAGONA to'q sirt.
Bu ataylab: AI — sahifa emas, **alohida xona**; oq va tinch mahsulotda bitta
tungi blok ko'zni o'ziga tortadi va Studio'ga o'tish uzluksiz bo'ladi.

- **Ildiz:** `.yz` (tokenlar shu yerda: `--yz-void/-panel/-ink/-ink-2/-ink-3/
  -blue/-indigo/-mint`). To'q sirtdagi HAR bir matn shu tokenlardan olinadi —
  `text-slate-*` ISHLATILMAYDI (kontrast buziladi).
- **Fon:** `.yz::before` aurora (3 radial qatlam, 46s drift) + `.yz::after`
  vinyetka + `.yz-grain`. Tor bannerda `.yz-band` varianti (Studio gradientlari
  past balandlikda kadrdan chiqib ketadi).
- **Sirtlar:** `.yz-card` (+`.yz-card-tap` — hover'da YORISHADI, ko'tarilish
  2px), `.yz-panel` (material bar/rail), `.yz-menu` (noshaffof — blur'ga
  tayanmaydi, §3.1 darsi).
- **Kirish maydoni:** `.yz-ring` — konus gradient hoshiya, fokusda/`data-state="busy"`
  da tezlashadi va nur kuchayadi. Ostida `.yz-horizon` (yumshoq nur).
- **Motion (hammasi MA'NO tashiydi, `prefers-reduced-motion` da to'liq o'chadi):**
  `.yz-word` — javob so'zma-so'z materializatsiya (kechikish 44 so'zda
  cheklangan), `.yz-rise` — bloklar blur→fokus, `.yz-ask` — savol kapsulasi
  spring, `.yz-thread`/`.yz-scan` — kutish, `.yz-sheen` — bir martalik
  yorug'lik, `.yz-row` — tarixdagi faol qatorning yonuvchi tayoqchasi.
  ⚠️ **Tarixdan ochilgan javob QAYTA yozilmaydi** (`animate=false`): eski
  javobni "yozib berish" — soxta taassurot.
- **Belgi:** `YechimOrb` (Studio, 34–92px) va `YechimMark` (kichik/oq sirt).
  Uchtala holat: `idle` / `thinking` / `found`.
- **Kategoriya rangi:** `categoryTintDark()` — oq sirtdagi `categoryTint()`
  bilan BIR XIL slot (bitta soha butun mahsulotda bitta rang oilasi).
- **Qoralama varag'i (`AiPublishSheet`) ATAYLAB OQ qoladi:** u platformaga
  e'lon qilish oqimi, ya'ni Studio'dan chiqish nuqtasi.

## 3. Taqiqlar (qisqa ro'yxat)
❌ Gradient fon/matn/avatar (brend logosidan tashqari) · ❌ glow soyalar ·
❌ hover-lift · ❌ `font-black` · ❌ KATTA HARFLI eyebrow-pill'lar (faqat
`.ios-section-header` yoki kichik tint eyebrow) · ❌ `border` bilan karta ·
❌ px-based `text-[..px]` · ❌ emoji-ikonka · ❌ lucide-react.

**Hover taqiqlari (2026-08-30):** ❌ `hover:opacity-*` · ❌ `hover:brightness-<1`
· ❌ `hover:underline` (o'rniga `.hv-link`) · ❌ kulrangdan kulrangga hover
(`hover:bg-fill-*`, `hover:text-brand-900`) · ❌ hover'da to'ldirilgan tugma
fonini ochirish (AA buziladi — javob NUR bilan) · ❌ javobsiz ("o'lik") boshqaruv.

## 3.1 CSS spetsifikatsiya qoidasi (⚠️ ikki marta tishlagan tuzoq)
`globals.css` dagi komponent klasslari `@tailwind utilities` DAN KEYIN keladi va
bir xil spetsifikatsiyaga ega — ya'ni ular utilitani BOSIB ketadi. Shuning uchun
**struktura beruvchi xossalar** (`display`, `position`, `flex`) doim `:where()`
ichida yoziladi (0 spetsifikatsiya → utilita doim yutadi):

```css
:where(.segmented) { display: inline-flex; }   /* to'g'ri */
.segmented         { display: inline-flex; }   /* ❌ `flex` utilitasini bosadi */
```
Tarix: `hairline-*`ning `position:relative`i navbar `sticky`/tab bar `fixed`ni
o'chirgan edi (2026-08-23); `.segmented`ning `inline-flex`i reyting sahifasida
segment'ni matn ustiga chiqarib yuborgan edi (2026-08-29). Hozir `:where()` bilan
himoyalanganlar: `hairline-b/t`, `segmented`, `segment`, `ios-row`, `card`,
`card-soft`, `chat-canvas`, `rec-pulse`, `ai-aura`, `ai-scan`, `medal-badge`.

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
- [x] 2026-08-29 (2-to'plam) — Footer rekvizit/kontakt/ishonch + `.brand-surface`;
  toggle tizimi (`use-toggle-action`) va idempotent backend API; navbar faol band
  brend tintida; `.segmented` spetsifikatsiya bugi (§3.1) va reyting sarlavha bloki;
  podium metallari + hover; formula paneli + loyiha bo'ylab kontrast auditi (24 joy);
  auth sahifalariga `AuthHomeLink` ("‹ Bosh sahifa"); chat FAB global + o'qilmagan
  hisobi. Build+lint toza, 19 marshrut × 2 viewport overflow 0, konsol 0.
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
