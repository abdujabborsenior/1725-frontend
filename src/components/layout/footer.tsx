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
 * bog'lanish → ishonch signallari → rekvizit qatori. Havolalar `font-medium`
 * va yuqori kontrastda (ilgari ingichka/och kulrang edi — o'qilmasdi).
 * Mobilda ham ko'rinadi (pastki tab bar ostida qolmasligi uchun padding).
 */
export function Footer() {
  const { contact } = SITE;

  return (
    <footer className="brand-surface footer-seam mt-12 text-white">
      <div className="mx-auto max-w-6xl px-4 pt-12 md:px-6 md:pt-14">
        {/* ── Navigatsiya + brend + bog'lanish ─────────────────────── */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-12 lg:gap-x-8">
          {/* Brend */}
          <div className="col-span-2 lg:col-span-3">
            <Link href="/" className="tappable inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white">
                <LogoMark className="h-6 w-6" />
              </span>
              <span className="text-title-3 font-semibold tracking-tight text-white">
                {SITE.name}
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-footnote leading-relaxed text-white/60">
              {SITE.tagline}. {SITE.description}
            </p>

            {/* Bog'lanish kanallari — hammasi ishlaydigan havolalar */}
            <div className="mt-5 flex items-center gap-2">
              <a
                href={contact.telegram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram orqali yozish"
                className="footer-chip tappable flex h-10 w-10 items-center justify-center rounded-full"
              >
                <PaperPlane className="h-[18px] w-[18px]" />
              </a>
              <a
                href={contact.mailto}
                aria-label="Email yozish"
                className="footer-chip tappable flex h-10 w-10 items-center justify-center rounded-full"
              >
                <Mail className="h-[18px] w-[18px]" />
              </a>
              <a
                href={contact.tel}
                aria-label="Telefon qilish"
                className="footer-chip tappable flex h-10 w-10 items-center justify-center rounded-full"
              >
                <Smartphone className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>

          {/* Havola ustunlari */}
          {COLS.map((col) => (
            <nav key={col.title} aria-label={col.title} className="lg:col-span-2">
              <h2 className="mb-3 text-footnote font-semibold uppercase tracking-[0.06em] text-white/45">
                {col.title}
              </h2>
              <ul className="space-y-0.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="footer-link inline-flex min-h-[32px] items-center py-1 text-footnote font-medium"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Bog'lanish */}
          <div className="col-span-2 lg:col-span-3">
            <h2 className="mb-3 text-footnote font-semibold uppercase tracking-[0.06em] text-white/45">
              Bog&apos;lanish
            </h2>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={contact.tel}
                  className="footer-link inline-flex items-start gap-2.5 text-footnote font-medium"
                >
                  <Smartphone className="mt-px h-4 w-4 shrink-0 text-accent-400" />
                  <span className="tabular-nums">{contact.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={contact.mailto}
                  className="footer-link inline-flex items-start gap-2.5 break-all text-footnote font-medium"
                >
                  <Mail className="mt-px h-4 w-4 shrink-0 text-accent-400" />
                  <span>{contact.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={contact.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link inline-flex items-start gap-2.5 text-footnote font-medium"
                >
                  <PaperPlane className="mt-px h-4 w-4 shrink-0 text-accent-400" />
                  <span>{contact.telegramLabel}</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-footnote text-white/60">
                <MapPin className="mt-px h-4 w-4 shrink-0 text-white/35" />
                <span>{contact.city}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Ishonch qatori ────────────────────────────────────────── */}
        <ul className="footer-rule mt-11 grid gap-5 py-7 sm:grid-cols-3 sm:gap-6">
          {TRUST_POINTS.map((p, i) => {
            const Icon = TRUST_ICONS[i] ?? ShieldCheck;
            return (
              <li key={p.title} className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-white/10 text-accent-400">
                  <Icon className="h-[17px] w-[17px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-footnote font-semibold text-white">{p.title}</p>
                  <p className="mt-0.5 text-caption-1 leading-relaxed text-white/55">{p.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Rekvizit qatori ─────────────────────────────────────────── */}
      <div className="footer-rule">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 pb-[calc(1.25rem+4rem+env(safe-area-inset-bottom))] text-caption-1 text-white/50 sm:flex-row sm:items-center sm:justify-between md:px-6 md:pb-5">
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
