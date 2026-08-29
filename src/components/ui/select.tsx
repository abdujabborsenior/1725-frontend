'use client';

import { cn } from '@/lib/utils';
import { Check, ChevronDown } from '@/components/icons';
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type SelectHTMLAttributes,
} from 'react';
import {
  FIELD_ERROR_TEXT,
  FIELD_ICON,
  FIELD_LABEL,
  FIELD_SIZE,
  FIELD_SURFACE,
} from './field-styles';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  /** Tashqi o'ram (kenglik va h.k.) uchun qo'shimcha class */
  containerClassName?: string;
}

/**
 * Custom listbox Select — native `<select>` popup'i har OS'da o'tkir burchakli
 * va stil qabul qilmaydi; bu komponent variantlar panelini loyihaning o'z
 * dizayn tilida (yumaloq, soft-shadow) ochadi. Form mosligi uchun yashirin
 * native select saqlanadi: react-hook-form `{...register()}` (ref+onChange)
 * ham, oddiy controlled `value/onChange` ham o'zgarishsiz ishlaydi.
 * Klaviatura: ↑↓/Home/End, Enter/Space, Esc, harf bilan sakrash (type-ahead).
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      className,
      containerClassName,
      disabled,
      'aria-label': ariaLabel,
      ...rest
    },
    forwardedRef,
  ) => {
    const listboxId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const selectRef = useRef<HTMLSelectElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const typeahead = useRef({ buffer: '', at: 0 });

    const isControlled = rest.value !== undefined;
    const [inner, setInner] = useState<string>(() =>
      String(rest.value ?? rest.defaultValue ?? options[0]?.value ?? ''),
    );
    const value = isControlled ? String(rest.value) : inner;

    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);

    const selectedIdx = options.findIndex((o) => String(o.value) === value);
    const selectedLabel = options[selectedIdx]?.label ?? options[0]?.label ?? '';

    /** Yashirin select'dan holatni o'qish — RHF ref orqali qiymat yozganda
     *  (defaultValues/reset) ko'rinish orqada qolmasin. */
    function syncFromNative() {
      const el = selectRef.current;
      if (el && !isControlled && el.value !== inner) setInner(el.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { syncFromNative(); }, []);

    // Tashqi bosishda yopish
    useEffect(() => {
      if (!open) return;
      const onDoc = (e: MouseEvent) => {
        if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener('mousedown', onDoc);
      return () => document.removeEventListener('mousedown', onDoc);
    }, [open]);

    function openList() {
      syncFromNative();
      setActive(Math.max(0, selectedIdx));
      setOpen(true);
    }

    function choose(v: string) {
      const el = selectRef.current;
      if (el) {
        el.value = v;
        // RHF register() va oddiy handler'lar o'qiy oladigan minimal event shakli
        rest.onChange?.({
          type: 'change',
          target: el,
          currentTarget: el,
        } as unknown as React.ChangeEvent<HTMLSelectElement>);
      }
      if (!isControlled) setInner(v);
      setOpen(false);
      triggerRef.current?.focus();
    }

    function moveActive(idx: number) {
      const clamped = Math.min(Math.max(idx, 0), options.length - 1);
      setActive(clamped);
      document
        .getElementById(`${listboxId}-opt-${clamped}`)
        ?.scrollIntoView({ block: 'nearest' });
    }

    /** Harf terilsa — shu harf(lar) bilan boshlanuvchi variantga sakrash */
    function onTypeahead(key: string) {
      if (key.length !== 1 || !/\S/.test(key)) return;
      const now = Date.now();
      const t = typeahead.current;
      t.buffer = now - t.at > 500 ? key : t.buffer + key;
      t.at = now;
      const q = t.buffer.toLowerCase();
      const hit = options.findIndex((o) => o.label.toLowerCase().startsWith(q));
      if (hit >= 0) moveActive(hit);
    }

    function onKeyDown(e: React.KeyboardEvent) {
      if (!open) {
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
          e.preventDefault();
          openList();
        }
        return;
      }
      switch (e.key) {
        case 'ArrowDown': e.preventDefault(); moveActive(active + 1); break;
        case 'ArrowUp':   e.preventDefault(); moveActive(active - 1); break;
        case 'Home':      e.preventDefault(); moveActive(0); break;
        case 'End':       e.preventDefault(); moveActive(options.length - 1); break;
        case 'Enter':
        case ' ': {
          e.preventDefault();
          const opt = options[active];
          if (opt) choose(String(opt.value));
          break;
        }
        case 'Escape': e.preventDefault(); setOpen(false); break;
        case 'Tab': setOpen(false); break;
        default: onTypeahead(e.key);
      }
    }

    return (
      <div ref={rootRef} className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && <label className={FIELD_LABEL}>{label}</label>}
        <div className="relative">
          {/* Form manbai — yashirin native select (RHF ref shu yerga ulanadi) */}
          <select
            ref={(el) => {
              selectRef.current = el;
              if (typeof forwardedRef === 'function') forwardedRef(el);
              else if (forwardedRef) forwardedRef.current = el;
            }}
            tabIndex={-1}
            aria-hidden="true"
            disabled={disabled}
            className="sr-only"
            {...rest}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <button
            ref={triggerRef}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={listboxId}
            aria-label={ariaLabel ?? label}
            disabled={disabled}
            onClick={() => (open ? setOpen(false) : openList())}
            onKeyDown={onKeyDown}
            onBlur={() => {
              if (!open) {
                rest.onBlur?.({
                  type: 'blur',
                  target: selectRef.current,
                } as unknown as React.FocusEvent<HTMLSelectElement>);
              }
            }}
            className={cn(
              FIELD_SURFACE,
              FIELD_SIZE.md,
              'cursor-pointer pr-10 text-left',
              'disabled:cursor-not-allowed disabled:opacity-40',
              error && 'border-rose-400',
              className,
            )}
          >
            <span className="block truncate">{selectedLabel}</span>
          </button>
          {/* Oshkor qilish belgisi — FAQAT pastga chevron (yuqori/past juftligi
              iOS'da qiymatni o'zgartiruvchi stepper ma'nosini beradi, ro'yxat
              ochuvchi maydonda emas). Ochilganda 180° buriladi. */}
          <span
            className={cn(
              'pointer-events-none absolute right-3.5 top-1/2 flex -translate-y-1/2 items-center',
              'transition-transform duration-250 ease-ios motion-reduce:transition-none',
              FIELD_ICON,
              open && 'rotate-180',
            )}
          >
            <ChevronDown className="h-[15px] w-[15px]" strokeWidth={2.5} />
          </span>

          {open && (
            <ul
              id={listboxId}
              role="listbox"
              aria-label={ariaLabel ?? label}
              className="material-menu absolute inset-x-0 top-full z-30 mt-2 max-h-64 origin-top animate-scale-in overflow-y-auto rounded-ios-lg p-1 shadow-modal ring-1 ring-black/[0.06]"
            >
              {options.map((o, i) => {
                const isSelected = String(o.value) === value;
                return (
                  <li
                    key={o.value}
                    id={`${listboxId}-opt-${i}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActive(i)}
                    // mousedown'da fokus trigger'dan ketmasin (blur race yo'q)
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(String(o.value))}
                    className={cn(
                      'flex min-h-[38px] cursor-pointer items-center justify-between gap-2 rounded-[9px] px-3 text-body transition-colors duration-150',
                      i === active ? 'bg-fill-tertiary text-brand-900' : 'text-brand-900',
                      isSelected && 'font-medium',
                    )}
                  >
                    <span className="truncate">{o.label}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-accent-600" strokeWidth={3} />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {error && <p className={FIELD_ERROR_TEXT}>{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
