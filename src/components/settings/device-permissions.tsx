'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Camera, Mic, Images, Spinner, ShieldCheck } from '@/components/icons';
import {
  queryMediaPermission,
  requestMediaAccess,
  type MediaPermissionState,
} from '@/lib/media-permissions';
import { VOICE_ENABLED } from '@/lib/chat-features';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

/* Holat yorlig'i lug'atda (`settings.devices.state.<holat>`), bu yerda faqat rang. */
const STATE_CLS: Record<MediaPermissionState, string> = {
  granted:     'bg-accent-50 text-accent-700 border-accent-200',
  denied:      'bg-rose-50 text-rose-600 border-rose-200',
  prompt:      'bg-slate-100 text-slate-600 border-slate-200',
  unsupported: 'bg-slate-100 text-slate-600 border-slate-200',
};

/**
 * Sozlamalar → "Qurilma ruxsatlari": kamera/mikrofon holati va so'rash tugmalari.
 * Galereya alohida qator — brauzerda uni oldindan so'rab bo'lmaydi (rasm/video
 * tanlanganda OS o'zi so'raydi), shu bois faqat tushuntirish ko'rsatiladi.
 */
export function DevicePermissions() {
  const t = useTranslations('settings.devices');
  const [cam, setCam] = useState<MediaPermissionState>('unsupported');
  const [mic, setMic] = useState<MediaPermissionState>('unsupported');
  const [busy, setBusy] = useState<'camera' | 'microphone' | null>(null);

  const refresh = useCallback(async () => {
    const [c, m] = await Promise.all([
      queryMediaPermission('camera'),
      queryMediaPermission('microphone'),
    ]);
    setCam(c);
    setMic(m);
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  async function request(kind: 'camera' | 'microphone') {
    setBusy(kind);
    const ok = await requestMediaAccess(kind === 'camera', kind === 'microphone');
    if (!ok) {
      toast.error(kind === 'camera' ? t('cameraDenied') : t('microphoneDenied'));
    }
    await refresh();
    setBusy(null);
  }

  const rows: {
    key: 'camera' | 'microphone';
    icon: typeof Camera;
    title: string;
    desc: string;
    state: MediaPermissionState;
  }[] = [
    { key: 'camera', icon: Camera, title: t('camera'), desc: t('cameraDesc'), state: cam },
    { key: 'microphone', icon: Mic, title: t('microphone'), desc: VOICE_ENABLED ? t('microphoneDesc') : t('microphoneOff'), state: mic },
  ];

  return (
    <div className="rounded-ios-2xl bg-white p-6 space-y-4">
      <h2 className="ios-section-header !px-0 !pt-0 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4" /> {t('title')}
      </h2>

      <div className="divide-y divide-slate-100">
        {rows.map(({ key, icon: Icon, title, desc, state }) => {
          const cls = STATE_CLS[state];
          const canRequest = state === 'prompt' || state === 'unsupported';
          return (
            <div key={key} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-ios-md bg-surface-soft text-slate-500">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-subhead font-semibold text-brand-900">{title}</p>
                <p className="text-footnote text-slate-500">{desc}</p>
              </div>
              <span className={cn('shrink-0 rounded-full border px-2.5 py-1 text-caption-1 font-semibold', cls)}>
                {t(`state.${state}`)}
              </span>
              {canRequest && (
                <button
                  onClick={() => void request(key)}
                  disabled={busy !== null}
                  className="shrink-0 rounded-full bg-accent-50 px-3.5 py-1.5 text-footnote font-semibold text-accent-700 transition-colors enabled:hover:bg-accent-100 active:bg-accent-200 disabled:opacity-60"
                >
                  {busy === key ? <Spinner className="h-3.5 w-3.5 animate-spin" /> : t('request')}
                </button>
              )}
            </div>
          );
        })}

        {/* Galereya — OS o'zi so'raydi, oldindan boshqarib bo'lmaydi */}
        <div className="flex items-center gap-3 py-3 last:pb-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-ios-md bg-surface-soft text-slate-500">
            <Images className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-subhead font-semibold text-brand-900">{t('gallery')}</p>
            <p className="text-footnote text-slate-500">
              {t('galleryDesc')}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-fill-tertiary px-2.5 py-1 text-caption-1 font-medium text-slate-600">
            {t('auto')}
          </span>
        </div>
      </div>

      <p className="text-footnote text-slate-500">
        {t('hint')}
      </p>
    </div>
  );
}
