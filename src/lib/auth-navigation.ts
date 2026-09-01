'use client';

/**
 * Auth holati o'zgargandan KEYINGI navigatsiya (kirish, ro'yxatdan o'tish,
 * chiqish) — HAR DOIM shu funksiya orqali.
 *
 * ILDIZ SABAB (2026-08-31 KRITIK bug, jonli reproduksiya qilingan):
 * Next App Router har bir marshrut uchun **client Router Cache** yuritadi.
 * Mehmon holatida `<Link>` prefetch qilgan himoyalangan marshrutlar
 * (footer'da: `/messages`, `/profile`, `/startups/create`, `/problems/create`)
 * middleware'dan REDIRECT javobini oladi va Next o'sha redirect'ni keshga
 * yozib qo'yadi. Login/register esa SOFT navigatsiya — keshni tozalamaydi.
 * Natijada endigina kirgan foydalanuvchi o'sha havolani bosganda
 * SERVERGA UMUMAN CHIQMASDAN mehmon davridagi redirect qayta ijro etiladi:
 * `/register?next=...` yoki `/login?next=...`. Bir necha daqiqadan keyin kesh
 * yozuvi eskirib "o'zidan-o'zi tuzalardi" — foydalanuvchi aynan shuni
 * ta'riflagan ("birozdan keyin ... keyin to'g'rilanyapti").
 *
 * NEGA `router.refresh()` EMAS: o'lchov bilan tekshirildi (Next 14.2) — u
 * boshqa marshrutlarning keshlangan redirect yozuvlarini bekor QILMADI, bug
 * saqlanib qoldi. `Next-Router-Prefetch` sarlavhasi ham middleware'ga
 * yetib bormaydi (faqat `purpose: prefetch` ko'rinadi), shuning uchun uni
 * middleware tomonda to'liq to'sib ham bo'lmaydi.
 *
 * YECHIM: auth o'zgarishida TO'LIQ sahifa yuklash (`location.assign`).
 * Brauzer hujjat yuklanganda butun client-side keshni tashlab yuboradi —
 * Next'ning ichki xulqiga bog'liq bo'lmagan yagona kafolat. Narxi: kirish/
 * chiqishда bitta qo'shimcha yuklanish (foydalanuvchi baribir "ilovaga
 * kirdim" deb kutadigan lahza). Boshqa hamma joyda SPA navigatsiyasi qoladi.
 */
export function navigateAfterAuthChange(target: string): void {
  if (typeof window === 'undefined') return;
  // Faqat ichki yo'l — open-redirect'ga yo'l qo'yilmaydi (next-capture'даги
  // `safeInternalPath` bilan bir xil qoida, bu yerda oxirgi qalqon sifatida).
  const safe =
    target.startsWith('/') && target[1] !== '/' && target[1] !== '\\' ? target : '/';
  window.location.assign(safe);
}
