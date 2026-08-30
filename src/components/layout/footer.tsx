import Link from 'next/link';
import { LogoMark } from '@/components/brand/logo-mark';
import { SITE, TRUST_POINTS } from '@/lib/site';
import {
  Mail,
  MapPin,
  PaperPlane,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
} from '@/components/icons';

const COLS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Platforma',
    links: [
      { label: 'Startaplar vitrinasi', href: '/startups' },
      { label: 'Top startaplar', href: '/leaderboard' },
      { label: 'Muammolar', href: '/problems' },
      { label: 'Yechim AI', href: '/ai' },
      { label: 'Bozor xaritasi', href: '/market' },
      { label: 'Ovoz berish', href: '/polls' },
    ],
  },
  {
    title: 'Hamjamiyat',
    links: [
      { label: 'Odamlarni kashf etish', href: '/discover' },
      { label: 'Guruhlar', href: '/discover' },
      { label: 'Suhbatlar', href: '/messages' },
      { label: 'Profil', href: '/profile' },
    ],
  },
  {
    title: 'Boshlash',
    links: [
      { label: 'Startap nima?', href: '/#startap-nima' },
      { label: 'Startap joylash', href: '/startups/create' },
      { label: 'Muammo qoldirish', href: '/problems/create' },
      { label: "Ro'yxatdan o'tish", href: '/register' },
      { label: 'Kirish', href: '/login' },
    ],
  },
];

/* Ishonch qatori belgilariga ma'no bo'yicha ikonka biriktiriladi (tartib
   `TRUST_POINTS` bilan bir xil) — matn manbai bitta joyda qoladi. */
const TRUST_ICONS = [Wallet, ShieldCheck, Sparkles];

/**
 * Footer — sahifaning poydevori.
 *
 * To'q navy sirt (logotipning O'Z rangi: #0A192F…#1C3B60) sahifa tugaganini
 * aniq bildiradi va kontaktlarga og'irlik beradi. Uch qatlam: navigatsiya +
 * bog'lanish → ishonch signallari → rekvizit qatori.
 *
 * TIPOGRAFIKA (2026-08-30): butun blok bir pog'ona kattalashtirildi —
 * havolalar `subhead` (15px/500), ustun sarlavhalari `callout` (16px/600, TO'LIQ
 * oq), ishonch matni va rekvizit qatori ham 15px. Ilgari hamma narsa 12–13px va
 * 45–55% oq edi: ustun sarlavhalari to'q sirtda 3.78:1 bergan (AA 4.5 dan past),
 * ya'ni o'qilmasdi. Endi eng past kontrast 5.5:1. Tegish maydonlari ham
 * standartga keltirildi (havola 40px, doiracha 44px).
 *
 * Mobilda ham ko'rinadi (pastki tab bar ostida qolmasligi uchun padding).
 */
export function Footer() {
  const { contact } = SITE;
  /* Email — tor ustunda ma'noli joydan uzilishi uchun `@` bo'yicha bo'linadi
     (aks holda brauzer uni "…@gmai / l.com" deb o'rtasidan kesadi). */
  const [emailLocal, emailDomain] = contact.email.split('@');

  return (
    <footer className="brand-surface footer-seam mt-12 text-white">
      <div className="mx-auto max-w-6xl px-4 pt-12 md:px-6 md:pt-14">
        {/* ── Navigatsiya + brend + bog'lanish ──────────────────────────
            lg'dan ustunlar `fr` bilan taqsimlanadi (qat'iy 12-panjara emas):
            15px matn 1024–1200px oralig'ida ham ustunga sig'adi. */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 md:gap-y-10 lg:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))_minmax(0,1.35fr)] lg:gap-x-6 xl:gap-x-8">
          {/* Brend */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="hv-logo tappable inline-flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-white">
                <LogoMark className="h-[26px] w-[26px]" />
              </span>
              <span className="text-title-2 font-semibold tracking-tight text-white">
                {SITE.name}
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-subhead leading-relaxed text-white/75">
              {SITE.tagline}. {SITE.description}
            </p>

            {/* Bog'lanish kanallari — hammasi ishlaydigan havolalar.
                44px — iOS HIG minimal tegish maydoni. */}
            <div className="mt-5 flex items-center gap-2.5">
              <a
                href={contact.telegram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram orqali yozish"
                className="footer-chip tappable flex h-11 w-11 items-center justify-center rounded-full"
              >
                <PaperPlane className="h-5 w-5" />
              </a>
              <a
                href={contact.mailto}
                aria-label="Email yozish"
                className="footer-chip tappable flex h-11 w-11 items-center justify-center rounded-full"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href={contact.tel}
                aria-label="Telefon qilish"
                className="footer-chip tappable flex h-11 w-11 items-center justify-center rounded-full"
              >
                <Smartphone className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Havola ustunlari */}
          {COLS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="mb-3 text-callout font-semibold tracking-tight text-white">
                {col.title}
              </h2>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="footer-link inline-flex min-h-[40px] items-center py-1 text-subhead font-medium leading-snug"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Bog'lanish */}
          <div className="col-span-2 lg:col-span-1">
            <h2 className="mb-3 text-callout font-semibold tracking-tight text-white">
              Bog&apos;lanish
            </h2>
            <ul className="space-y-1">
              <li>
                <a
                  href={contact.tel}
                  className="footer-link inline-flex min-h-[40px] items-center gap-2.5 py-1 text-subhead font-medium"
                >
                  <Smartphone className="h-[18px] w-[18px] shrink-0 text-accent-400" />
                  <span className="tabular-nums">{contact.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={contact.mailto}
                  className="footer-link inline-flex min-h-[40px] items-center gap-2.5 py-1 text-subhead font-medium leading-snug [overflow-wrap:anywhere]"
                >
                  <Mail className="h-[18px] w-[18px] shrink-0 text-accent-400" />
                  <span>
                    {emailLocal}
                    <wbr />@{emailDomain}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={contact.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link inline-flex min-h-[40px] items-center gap-2.5 py-1 text-subhead font-medium"
                >
                  <PaperPlane className="h-[18px] w-[18px] shrink-0 text-accent-400" />
                  <span>{contact.telegramLabel}</span>
                </a>
              </li>
              <li className="flex items-center gap-2.5 pt-1 text-subhead text-white/70">
                <MapPin className="h-[18px] w-[18px] shrink-0 text-white/50" />
                <span>{contact.city}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Ishonch qatori ────────────────────────────────────────── */}
        <ul className="footer-rule mt-10 grid gap-6 py-7 sm:mt-11 sm:grid-cols-3 sm:gap-8 sm:py-8">
          {TRUST_POINTS.map((p, i) => {
            const Icon = TRUST_ICONS[i] ?? ShieldCheck;
            return (
              <li key={p.title} className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-white/10 text-accent-400">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-callout font-semibold text-white">{p.title}</p>
                  <p className="mt-1 text-subhead leading-relaxed text-white/70">{p.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Rekvizit qatori ─────────────────────────────────────────── */}
      <div className="footer-rule">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 pb-[calc(1.5rem+4rem+env(safe-area-inset-bottom))] text-subhead text-white/65 sm:flex-row sm:items-center sm:justify-between md:px-6 md:pb-6">
          <p>
            © {new Date().getFullYear()} {SITE.name} · Barcha huquqlar himoyalangan
          </p>
          <p className="sm:text-right">
            {contact.city} · O&apos;zbekiston yoshlari uchun yaratildi
          </p>
        </div>
      </div>
    </footer>
  );
}
