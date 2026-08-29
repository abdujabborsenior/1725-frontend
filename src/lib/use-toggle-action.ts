'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/api';
import { patchEntityInQueries } from '@/lib/entity-sync';
import { useAuthStore } from '@/store/auth.store';

export interface ToggleResult {
  on: boolean;
  count?: number;
}

interface Options {
  /** Obyekt ID — React Query keshini yangilash uchun */
  id: string;
  /** Server bergan joriy holat (prop) */
  on: boolean;
  /** Server bergan joriy sanoq (prop) */
  count?: number;
  /**
   * Serverga **NIYAT** yuboradi (`next` — kutilayotgan yakuniy holat) va
   * serverning yakuniy holatini qaytaradi.
   */
  commit: (next: boolean) => Promise<ToggleResult>;
  /**
   * Keshdagi obyektga yoziladigan maydon nomlari. `on` bir nechta bo'lishi
   * mumkin — bitta holat turli javob shakllarida turlicha atalgan bo'lsa
   * (masalan asoschi ovozi: liderbordda `votedByMe`, profilda
   * `founderVotedByMe`), hammasi birdek yangilanadi.
   */
  fields: { on: string | string[]; count?: string };
  onChange?: (on: boolean, count: number) => void;
}

/**
 * **Yoqtirish / saqlash / foydali** tugmalarining yagona mantiqi.
 *
 * Uchta muammoni bir joyda yopadi:
 *
 * 1. **Eskirgan holat.** Ro'yxat sahifalari SSR'da tokensiz keladi
 *    (`likedByMe: false`), shaxsiy flaglar keyin background refetch bilan
 *    tushadi. Sof `toggle` semantikasida shu oraliqda bosilgan "yoqtirish"
 *    serverda BEKOR qilish bo'lib chiqardi. Endi serverga niyat yuboriladi
 *    (`liked: true`) — natija foydalanuvchi kutgani bilan doim bir xil.
 *
 * 2. **Tez ketma-ket bosish.** Tugma so'rov davomida `disabled` QILINMAYDI:
 *    oxirgi niyat eslab qolinadi va so'rov tugagach kerak bo'lsa yana
 *    yuboriladi ("latest intent wins"). Ilgari ikkinchi bosish jimgina
 *    yo'qolardi — sekin tarmoqda "qaytarib olish ishlamayapti" shu edi.
 *
 * 3. **Sahifalararo izchillik.** Natija React Query keshidagi HAR BIR
 *    nusxaga yoziladi (ro'yxat, detal, profil) — orqaga qaytganda holat
 *    o'zgarmaydi.
 */
export function useToggleAction({ id, on, count, commit, fields, onChange }: Options) {
  const { token } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const qc = useQueryClient();

  const [state, setState] = useState(on);
  const [num, setNum] = useState(count ?? 0);
  const [pending, setPending] = useState(false);

  /** Foydalanuvchi bosgandan keyin prop bilan qayta sinxronlanmaydi. */
  const interacted = useRef(false);
  /**
   * Ekranda ko'rinayotgan holatning REF nusxasi.
   *
   * ⚠️ `state` dan foydalanib bo'lmaydi: bir tikda ketma-ket bosilgan
   * bosishlar bitta closure'ni ko'radi (React setState darhol o'qilmaydi),
   * shuning uchun 4 ta tez bosish 1 ta o'zgarish bo'lib qolardi — jonli
   * sinovda aynan shunday chiqdi. Ref har bosishda darhol yangilanadi.
   */
  const current = useRef(on);
  /** Oxirgi TASDIQLANGAN server holati — xatoda shunga qaytamiz. */
  const confirmed = useRef({ on, count: count ?? 0 });
  /** Navbatdagi niyat (null = navbat bo'sh). */
  const desired = useRef<boolean | null>(null);
  const running = useRef(false);

  // Auth bilan refetch kelganda (SSR'da flaglar bo'lmaydi) holatni tiklaymiz.
  useEffect(() => {
    if (interacted.current) return;
    confirmed.current = { on, count: count ?? 0 };
    current.current = on;
    setState(on);
    setNum(count ?? 0);
  }, [on, count]);

  const drain = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    setPending(true);
    try {
      while (desired.current !== null) {
        const want = desired.current;
        desired.current = null;
        const res = await commit(want);
        confirmed.current = { on: res.on, count: res.count ?? confirmed.current.count };
        // Yangi niyat kelgan bo'lsa — ekranni hozir yangilamaymiz, sikl davom etadi.
        if (desired.current === null) {
          current.current = res.on;
          setState(res.on);
          if (res.count !== undefined) setNum(res.count);
          const patch: Record<string, unknown> = {};
          for (const f of Array.isArray(fields.on) ? fields.on : [fields.on]) {
            patch[f] = res.on;
          }
          if (fields.count && res.count !== undefined) patch[fields.count] = res.count;
          patchEntityInQueries(qc, id, patch);
          onChange?.(res.on, res.count ?? confirmed.current.count);
        }
      }
    } catch (err) {
      desired.current = null;
      current.current = confirmed.current.on;
      setState(confirmed.current.on);
      setNum(confirmed.current.count);
      toast.error(getErrorMessage(err));
    } finally {
      running.current = false;
      setPending(false);
    }
  }, [commit, fields.on, fields.count, id, onChange, qc]);

  const toggle = useCallback(
    (e?: { preventDefault: () => void; stopPropagation: () => void }) => {
      // Karta ichida: bosish kartaning havolasiga O'TMAYDI.
      e?.preventDefault();
      e?.stopPropagation();

      if (!token) {
        // Kirgandan keyin AYNAN shu sahifaga qaytadi (kontekst yo'qolmaydi).
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      interacted.current = true;
      const next = !current.current;
      current.current = next;
      setState(next);
      if (count !== undefined) setNum((c) => Math.max(0, c + (next ? 1 : -1)));
      desired.current = next;
      void drain();
    },
    [count, drain, pathname, router, token],
  );

  return { on: state, count: num, pending, toggle };
}
