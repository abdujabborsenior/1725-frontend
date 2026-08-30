'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { MoreHorizontal } from '@/components/icons';
import { cn } from '@/lib/utils';

/**
 * Serverda `useLayoutEffect` ogohlantirish beradi (u yerda DOM yo'q), lekin
 * mijozda AYNAN u kerak: o'lchov birinchi bo'yashdan OLDIN bajarilib, bandlar
 * "sakrab" qayta joylashmasligi kerak.
 */
const useIsoLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

interface PillRect {
  left: number;
  width: number;
  on: boolean;
}

export interface NavItem {
  href: string;
  label: string;
  /** Yorliq oldidagi belgi (Yechim AI) — bo'lsa band biroz kengroq bo'ladi. */
  icon?: ReactNode;
}

/**
 * **Sig'ganicha ko'rsatadigan navigatsiya.**
 *
 * Navbar bandlari qat'iy breakpoint bilan emas, HAQIQIY o'lchov bilan
 * boshqariladi: mavjud joyga sig'ganlari qatorda qoladi, qolganlari «•••»
 * menyusiga tushadi. Shu bilan band qo'shilganda (masalan "Tariflar" — to'lov
 * bo'limi yoqilganda) yoki yorliq uzunroq tilga o'girilganda navbar hech qachon
 * toshib ketmaydi va qo'lda sozlash kerak bo'lmaydi.
 *
 * O'lchov ko'rinmas nusxa qatlamidan olinadi — u har doim TO'LIQ ro'yxatni
 * saqlaydi, shuning uchun bandlar yashiringandan keyin ham kengligi ma'lum
 * bo'ladi (aks holda "yashir → joy bo'shadi → ko'rsat" sikliga tushib qolinardi).
 */
export function AdaptiveNav({
  items,
  pathname,
  className,
}: {
  items: NavItem[];
  pathname: string;
  className?: string;
}) {
  const navRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  // Server va birinchi render: hammasi ko'rinadi (hidratsiya mos bo'lsin),
  // so'ng bo'yashdan oldin haqiqiy o'lchov bo'yicha qisqartiriladi.
  const [visibleCount, setVisibleCount] = useState(items.length);
  /* Suzuvchi kapsula (signature): kursor qaysi bandda bo'lsa o'sha yerga
     SIRPANIB boradi, kursor chiqsa faol bandga qaytadi. Shu bilan faol
     holat ham, hover ham bitta jonli element bilan aytiladi — kulrang
     yuvindi ham, "o'lik" band ham qolmaydi. */
  const [hovered, setHovered] = useState<number | null>(null);
  const [pill, setPill] = useState<PillRect>({ left: 0, width: 0, on: false });
  // `ready` bo'lgunicha faol band O'Z fonini ko'rsatadi (SSR/birinchi bo'yash
  // uchun) va kapsula animatsiyasiz joylashadi — chetdan "uchib kelmaydi".
  const [ready, setReady] = useState(false);

  const visible = items.slice(0, visibleCount);
  const hidden = items.slice(visibleCount);

  // Kapsula manzili: ko'rinadigan bandlar, keyin (bo'lsa) «•••» tugmasi.
  let activeIndex = visible.findIndex((item) => isActive(pathname, item.href));
  if (activeIndex < 0 && hidden.some((item) => isActive(pathname, item.href))) {
    activeIndex = visible.length;
  }

  const measure = useCallback(() => {
    const nav = navRef.current;
    const layer = measureRef.current;
    if (!nav || !layer) return;

    const children = Array.from(layer.children) as HTMLElement[];
    if (children.length < 2) return;

    const moreButton = children[children.length - 1];
    const itemNodes = children.slice(0, -1);
    if (!itemNodes.length) return;

    const available = availableWidth(nav);
    const start = itemNodes[0].offsetLeft;
    // Har band tugagunicha kerak bo'ladigan joy (oraliqlar bilan birga).
    const ends = itemNodes.map(
      (el) => el.offsetLeft + el.offsetWidth - start,
    );

    if (ends[ends.length - 1] <= available) {
      setVisibleCount(itemNodes.length);
      return;
    }

    const gap = parseFloat(getComputedStyle(layer).columnGap) || 0;
    const reserved = moreButton.offsetWidth + gap;

    let fits = 0;
    for (let i = 0; i < ends.length; i++) {
      if (ends[i] + reserved > available) break;
      fits = i + 1;
    }
    // Hamma band yashirilib faqat «•••» qolishi ma'nosiz — hech bo'lmasa
    // bittasi ko'rinsin (bunday tor holat amalda mobil menyuga o'tadi).
    setVisibleCount(Math.max(fits, ends.length > 0 ? 1 : 0));
  }, []);

  const syncPill = useCallback(
    (activeIndex: number, hoverIndex: number | null) => {
      const nav = navRef.current;
      if (!nav) return;
      const nodes = nav.querySelectorAll<HTMLElement>('[data-nav-item]');
      const index = hoverIndex ?? activeIndex;
      const node = index >= 0 ? nodes[index] : undefined;
      if (!node) {
        setPill((prev) => (prev.on ? { ...prev, on: false } : prev));
        return;
      }
      /* `offsetLeft` EMAS: «•••» tugmasi o'zining `relative` o'ramida turadi,
         ya'ni uning offsetParent'i nav emas — kapsula noto'g'ri joyga tushardi.
         Ekran koordinatalari farqi offsetParent'ga umuman bog'liq emas. */
      const navBox = nav.getBoundingClientRect();
      const box = node.getBoundingClientRect();
      const next = {
        left: Math.round(box.left - navBox.left),
        width: Math.round(box.width),
        on: true,
      };
      setPill((prev) =>
        prev.left === next.left && prev.width === next.width && prev.on
          ? prev
          : next,
      );
      setReady(true);
    },
    [],
  );

  const syncPillRef = useRef(() => {});
  syncPillRef.current = () => syncPill(activeIndex, hovered);

  useIsoLayoutEffect(() => {
    measure();

    const nav = navRef.current;
    const layer = measureRef.current;
    if (!nav || !layer || typeof ResizeObserver === 'undefined') return;

    // rAF — ResizeObserver ichida darhol o'lchash "loop limit exceeded"
    // ogohlantirishiga olib keladi.
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        measure();
        // Kenglik o'zgarganda bandlar siljiydi — kapsula ular bilan birga
        // ko'chishi kerak (aks holda eski joyda "osilib" qoladi).
        syncPillRef.current();
      });
    });
    observer.observe(nav);
    // Ota konteyner — joy hisobi undan olinadi (logo/amallar o'zgarishi ham
    // shu yerda aks etadi: masalan bildirishnoma hisobi 9→9+ bo'lganda).
    if (nav.parentElement) observer.observe(nav.parentElement);
    // Nusxa qatlami ham kuzatiladi: shrift yuklangach yorliqlar kengligi
    // o'zgaradi (`font-display: optional` bo'lsa ham til/zoom o'zgarishi bor).
    observer.observe(layer);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [measure, items.length]);

  // Faol band o'zgarsa yorliq qalinlashadi (semibold) — kengliklar biroz
  // o'zgaradi, shuning uchun qayta o'lchaymiz.
  useIsoLayoutEffect(() => {
    measure();
  }, [pathname, measure]);

  // Kapsula har bir tegishli o'zgarishda qayta joylashadi (bo'yashdan oldin).
  useIsoLayoutEffect(() => {
    syncPill(activeIndex, hovered);
  }, [syncPill, activeIndex, hovered, visibleCount]);

  return (
    <nav
      ref={navRef}
      onPointerLeave={() => setHovered(null)}
      className={cn(
        'relative ml-2 hidden min-w-0 flex-1 items-center gap-0.5 xl:flex',
        className,
      )}
    >
      <NavPill
        rect={pill}
        ready={ready}
        preview={hovered !== null && hovered !== activeIndex}
        hot={hovered !== null && hovered === activeIndex}
      />
      {visible.map((item, index) => (
        <NavLink
          key={item.href}
          item={item}
          pathname={pathname}
          index={index}
          onHover={setHovered}
          ownBackground={!ready}
        />
      ))}
      {hidden.length > 0 && (
        <OverflowMenu
          items={hidden}
          pathname={pathname}
          index={visible.length}
          onHover={setHovered}
          ownBackground={!ready}
        />
      )}

      {/*
        Ko'rinmas o'lchov qatlami — TO'LIQ ro'yxat + «•••» tugmasi shakli.
        `visibility: hidden` (opacity emas): bosish ham, ekran o'quvchi ham
        tegmaydi, lekin o'lchamlari o'qiladi. `absolute` — oqimga ta'sir qilmaydi.
      */}
      <div
        ref={measureRef}
        aria-hidden
        /*
          `fixed` + ekrandan tashqarida: `visibility: hidden` elementi ham
          hujjat KENGLIGIGA qo'shiladi (o'lchandi: sahifa 11px gorizontal
          scroll olardi). `fixed` esa hujjat oqimidan butunlay chiqadi,
          o'lchamlari esa o'qilaveradi.
        */
        className="pointer-events-none fixed left-[-9999px] top-0 flex select-none items-center gap-0.5"
        style={{ visibility: 'hidden' }}
      >
        {items.map((item) => (
          <span key={item.href} className={navItemClass(isActive(pathname, item.href), !!item.icon)}>
            {item.icon}
            <span>{item.label}</span>
          </span>
        ))}
        <span className={MORE_BUTTON_CLASS}>
          <MoreHorizontal className="h-[18px] w-[18px]" />
        </span>
      </div>
    </nav>
  );
}

/* ── Ichki qismlar ──────────────────────────────────────────────── */

/**
 * Navigatsiyaga HAQIQATAN qancha joy tegishini hisoblaydi.
 *
 * `nav.clientWidth` ga tayanib bo'lmaydi: bandlar `white-space: nowrap`
 * bo'lgani uchun nav o'z ichidagi kontent hisobiga CHO'ZILADI va o'zi
 * bermoqchi bo'lgan javobni buzadi ("sig'di" deb ko'rsatadi, holbuki
 * qatordagi boshqa elementlarni surib yuborgan). Shuning uchun joy ota
 * konteynerdan hisoblanadi: umumiy kenglikdan logo, amallar va oraliqlar
 * ayriladi — bu qiymat nav ichidagi kontentga bog'liq emas.
 */
function availableWidth(nav: HTMLElement): number {
  const bar = nav.parentElement;
  if (!bar) return nav.clientWidth;

  const barStyle = getComputedStyle(bar);
  const gap = parseFloat(barStyle.columnGap) || 0;
  const padding =
    (parseFloat(barStyle.paddingLeft) || 0) +
    (parseFloat(barStyle.paddingRight) || 0);

  let siblingsWidth = 0;
  let visibleChildren = 0;
  for (const child of Array.from(bar.children) as HTMLElement[]) {
    // Yashirin elementlar (mobil/desktop almashinuvi) joy egallamaydi.
    const width = child === nav ? 0 : child.offsetWidth;
    if (child !== nav && width === 0) continue;
    siblingsWidth += width;
    visibleChildren++;
  }

  const gaps = Math.max(0, visibleChildren - 1) * gap;
  const navMargin = parseFloat(getComputedStyle(nav).marginLeft) || 0;

  return bar.clientWidth - padding - siblingsWidth - gaps - navMargin;
}


function isActive(pathname: string, href: string): boolean {
  return pathname.startsWith(href);
}

/**
 * Band uslubi — ko'rinadigan bandda ham, o'lchov qatlamida ham AYNAN bir xil
 * bo'lishi shart, aks holda o'lchov haqiqatdan chetlashadi.
 */
function navItemClass(
  active: boolean,
  hasIcon: boolean,
  ownBackground = true,
): string {
  return cn(
    // `relative` — suzuvchi kapsula absolyut joylashgan, yorliq undan
    // YUQORIDA bo'yalishi kerak.
    'relative whitespace-nowrap rounded-full py-1.5 text-subhead transition-colors duration-200 ease-ios',
    hasIcon ? 'flex items-center gap-1.5 pl-2 pr-2.5' : 'px-2.5',
    // Faol band — brend tinti (kulrang emas). Fonni odatda suzuvchi kapsula
    // beradi; `ownBackground` faqat kapsula o'lchanmagunicha (SSR/birinchi
    // bo'yash) yoqiladi — shunda faol holat bir zum ham yo'qolmaydi.
    active
      ? cn('font-semibold text-accent-700', ownBackground && 'bg-accent-50')
      : 'font-medium text-slate-500 hover:text-brand-900',
  );
}

const MORE_BUTTON_CLASS =
  'tappable relative flex h-8 shrink-0 items-center justify-center rounded-full px-2 text-slate-500 transition-colors duration-200 ease-ios hover:text-brand-900';

/** Suzuvchi kapsula — faol/hover holatining YAGONA vizual tashuvchisi. */
function NavPill({
  rect,
  ready,
  preview,
  hot,
}: {
  rect: PillRect;
  ready: boolean;
  preview: boolean;
  /** Kursor AYNAN faol bandda — kapsula bir qadam to'qlashadi (javobsiz qolmaydi). */
  hot: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'nav-pill',
        rect.on && ready && 'nav-pill-on',
        preview && 'nav-pill-preview',
        hot && 'nav-pill-hot',
      )}
      style={{
        transform: `translate3d(${rect.left}px, -50%, 0)`,
        width: rect.width,
      }}
    />
  );
}

function NavLink({
  item,
  pathname,
  index,
  onHover,
  ownBackground,
}: {
  item: NavItem;
  pathname: string;
  index: number;
  onHover: (index: number | null) => void;
  ownBackground: boolean;
}) {
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      data-nav-item
      aria-current={active ? 'page' : undefined}
      onPointerEnter={() => onHover(index)}
      onFocus={() => onHover(index)}
      onBlur={() => onHover(null)}
      className={navItemClass(active, !!item.icon, ownBackground)}
    >
      {item.icon}
      <span>{item.label}</span>
    </Link>
  );
}

/** Sig'magan bandlar — iOS materialidagi ixcham menyu. */
function OverflowMenu({
  items,
  pathname,
  index,
  onHover,
  ownBackground,
}: {
  items: NavItem[];
  pathname: string;
  index: number;
  onHover: (index: number | null) => void;
  ownBackground: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const activeInside = items.some((i) => isActive(pathname, i.href));

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus(); // fokus tugmaga qaytadi (a11y)
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // Boshqa sahifaga o'tilganda menyu ochiq qolmasin.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        data-nav-item
        onClick={() => setOpen((o) => !o)}
        onPointerEnter={() => onHover(index)}
        onFocus={() => onHover(index)}
        onBlur={() => onHover(null)}
        aria-label="Yana"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          MORE_BUTTON_CLASS,
          // Menyu ichida faol sahifa bo'lsa tugma ham faol ko'rinadi —
          // foydalanuvchi qayerdaligini yo'qotmasin. Fonni suzuvchi kapsula
          // beradi; menyu OCHIQ bo'lsa esa o'z tinti (kapsula boshqa bandga
          // ketib qolishi mumkin).
          (open || activeInside) && 'text-accent-700',
          (open || (activeInside && ownBackground)) && 'bg-accent-50',
        )}
      >
        <MoreHorizontal className="h-[18px] w-[18px]" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Qo'shimcha bo'limlar"
          className="material-menu absolute left-0 z-50 mt-2 min-w-[184px] origin-top-left animate-scale-in overflow-hidden rounded-ios-lg py-1 shadow-modal ring-1 ring-black/[0.06]"
        >
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                aria-current={active ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  'hv-row flex items-center gap-2.5 px-4 py-2.5 text-body',
                  active
                    ? 'bg-accent-50 font-semibold text-accent-700'
                    : 'text-brand-900',
                )}
              >
                {item.icon}
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
