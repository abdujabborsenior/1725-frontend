/**
 * Kategoriya → iOS system rangi (YAGONA manba).
 *
 * Startap kartasi, muammo kartasi va detal sahifalari bir xil tasnif rangidan
 * foydalanadi: bitta soha butun mahsulotda bir xil rangda ko'rinadi. Rang
 * dekor emas — u tasnif belgisi, shuning uchun kulrang faqat kategoriya
 * UMUMAN yo'q bo'lganda qoladi.
 */
const TINTS = [
  { chip: 'bg-accent-50 text-accent-700', bar: 'bg-accent-500', cover: 'bg-gradient-to-br from-accent-400 to-accent-600' },
  { chip: 'bg-iris-50 text-iris-700', bar: 'bg-iris-500', cover: 'bg-gradient-to-br from-iris-400 to-iris-600' },
  { chip: 'bg-emerald-50 text-emerald-700', bar: 'bg-emerald-400', cover: 'bg-gradient-to-br from-emerald-400 to-emerald-600' },
  { chip: 'bg-amber-50 text-amber-700', bar: 'bg-amber-500', cover: 'bg-gradient-to-br from-amber-400 to-amber-600' },
  { chip: 'bg-pink-50 text-pink-700', bar: 'bg-pink-500', cover: 'bg-gradient-to-br from-pink-400 to-pink-600' },
  { chip: 'bg-violet-50 text-violet-700', bar: 'bg-violet-500', cover: 'bg-gradient-to-br from-violet-400 to-violet-600' },
  { chip: 'bg-sky-50 text-sky-700', bar: 'bg-sky-500', cover: 'bg-gradient-to-br from-sky-400 to-sky-600' },
  { chip: 'bg-teal-50 text-teal-700', bar: 'bg-teal-500', cover: 'bg-gradient-to-br from-teal-400 to-teal-600' },
] as const;

/* Ma'noga bog'langan kategoriyalar (bazadagi real nomlar + variantlari).
   Ro'yxatda yo'q kategoriya ham RANGSIZ qolmaydi — nomi bo'yicha barqaror
   hash bilan shu palitradan rang oladi (yangi kategoriya qo'shilsa ham). */
const CATEGORY_SLOT: Record<string, number> = {
  Texnologiya: 0, Tech: 0, FinTech: 0, Fintex: 0, Fintech: 0, Iqtisod: 0, Moliya: 0,
  AI: 1, 'AI / ML': 1, 'AI/ML': 1, ML: 1, Innovatsiya: 1,
  AgroTech: 2, GreenTech: 2, Agro: 2, Ekologiya: 2, 'Qishloq xo‘jaligi': 2,
  'E-commerce': 3, Ecommerce: 3, Savdo: 3, Marketplace: 3, Turizm: 3,
  HealthTech: 4, "Sog'liq": 4, MedTech: 4, Tibbiyot: 4, "Sog'liqni saqlash": 4,
  EdTech: 5, "Ta'lim": 5, "Ta’lim": 5, "O'yinlar": 5, Games: 5, Sport: 5,
  Ijtimoiy: 6, Media: 6, Social: 6, Sayohat: 6, Madaniyat: 6,
  Logistika: 7, Transport: 7, Delivery: 7, Infratuzilma: 7, "Uy-joy": 7,
};

function slotFor(category: string): number {
  const known = CATEGORY_SLOT[category];
  if (known !== undefined) return known;
  let h = 0;
  for (let i = 0; i < category.length; i++) h = (h * 31 + category.charCodeAt(i)) | 0;
  return Math.abs(h) % TINTS.length;
}

const NEUTRAL_TINT = {
  chip: 'bg-fill-tertiary text-slate-600',
  bar: 'bg-slate-300',
  cover: 'bg-gradient-to-br from-slate-300 to-slate-400',
};

export function categoryTint(category?: string | null): {
  chip: string;
  bar: string;
  cover: string;
} {
  const key = category?.trim();
  return key ? TINTS[slotFor(key)] : NEUTRAL_TINT;
}
