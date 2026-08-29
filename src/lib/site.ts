/**
 * Sayt rekvizitlari — YAGONA manba.
 *
 * Telefon/email/manzil bir nechta joyda kerak bo'ladi (footer, bog'lanish
 * bloklari, `mailto:`/`tel:` havolalar, kelajakda hujjat sahifalari). Ular
 * shu yerda bir marta yoziladi: raqam o'zgarsa bitta fayl tahrirlanadi va
 * mahsulot bo'ylab hech qayerda eskirgan kontakt qolmaydi.
 *
 * Faqat HAQIQIY, ishlaydigan kanallar turadi — "keyin to'ldiramiz" degan
 * bo'sh havola qo'yilmaydi (bosilganda 404 beradigan social ikonkalar
 * ishonchni oshirmaydi, aksincha).
 */

/** E.164 formatidagi raqam — `tel:` va Telegram havolalari uchun. */
const PHONE_E164 = '+998770131725';

/** Inson o'qiydigan ko'rinish: +998 77 013 17 25 */
function humanPhone(e164: string): string {
  const d = e164.replace(/\D/g, ''); // 998770131725
  return `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10)}`;
}

export const SITE = {
  name: 'MYMarkaz',
  /** Bir jumlalik ta'rif — footer va meta uchun */
  tagline: "G'oyadan startapgacha — birgalikda",
  description:
    "O'quvchilar, talabalar va kreativ yoshlar uchun muammoni yechib, jamoa qurib, mahsulot yaratish maydoni.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mymarkaz.uz',

  contact: {
    phoneE164: PHONE_E164,
    phone: humanPhone(PHONE_E164),
    tel: `tel:${PHONE_E164}`,
    email: 'abdujabbordeveloper@gmail.com',
    mailto: 'mailto:abdujabbordeveloper@gmail.com',
    /** Telegram — raqam orqali (alohida username talab qilmaydi) */
    telegram: `https://t.me/${PHONE_E164}`,
    telegramLabel: 'Telegram',
    city: "Toshkent, O'zbekiston",
    /** Javob berish vaqti — ishonch signali, va'da emas */
    hours: 'Dushanba–Shanba · 09:00–20:00',
  },
} as const;

/** Footer ishonch qatori — mahsulotning haqiqiy va'dalari (dekor emas). */
export const TRUST_POINTS: { title: string; text: string }[] = [
  { title: 'Bepul foydalanish', text: "Joylash, yechim berish va baholash — to'lovsiz" },
  { title: "Ma'lumot xavfsizligi", text: 'Shifrlangan ulanish, parol hech qachon ochiq saqlanmaydi' },
  { title: 'Jonli qo‘llab-quvvatlash', text: SITE.contact.hours },
];
