'use client';

import { useRouter } from '@/i18n/navigation';
import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Flag, ShieldAlert } from '@/components/icons';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { reportsApi } from '@/lib/api';
import { REPORT_REASONS_BY_TYPE } from '@/lib/constants';
import { getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import { FIELD_SURFACE } from '@/components/ui/field-styles';
import type { ReportReason, ReportTargetType } from '@/types';

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
}

/** Shikoyat oynasi — sabab tanlash + ixtiyoriy izoh (300 belgigacha) */
export function ReportDialog({ open, onClose, targetType, targetId }: ReportDialogProps) {
  const t = useTranslations('report');
  const tc = useTranslations('common');
  const detailsId = useId();
  const reasons = REPORT_REASONS_BY_TYPE[targetType] ?? [];
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!reason) {
      toast.error(t('pickReason'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await reportsApi.create({
        targetType,
        targetId,
        reason,
        details: details.trim() || undefined,
      });
      toast.success(res.message ?? t('sent'));
      setReason(null);
      setDetails('');
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('title', { target: targetType })}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-2.5 rounded-ios-md bg-amber-50 border border-amber-200 px-3.5 py-2.5">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-footnote text-amber-800">
            {t('notice')}
          </p>
        </div>

        {/* Sabablar */}
        <div className="space-y-1.5">
          {reasons.map((r) => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={cn(
                'flex w-full items-center gap-3 rounded-ios-md border px-3.5 py-2.5 text-start text-subhead font-medium transition-all',
                reason === r
                  ? 'border-accent-500 bg-accent-50 text-accent-800'
                  : 'border-slate-200 text-slate-700 hover:border-accent-200 hover:bg-accent-50 hover:text-accent-700 active:bg-accent-100',
              )}
            >
              <span
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
                  reason === r ? 'border-accent-500' : 'border-slate-300',
                )}
              >
                {reason === r && <span className="h-2 w-2 rounded-full bg-accent-500" />}
              </span>
              {t(`reason.${r}`)}
            </button>
          ))}
        </div>

        {/* Izoh */}
        <div>
          <label htmlFor={detailsId} className="mb-1.5 block text-footnote font-semibold text-slate-600">
            {t('detailsLabel')}
          </label>
          <textarea
            id={detailsId}
            value={details}
            onChange={(e) => setDetails(e.target.value.slice(0, 300))}
            rows={3}
            placeholder={t('detailsPlaceholder')}
            className={cn(FIELD_SURFACE, 'resize-none px-4 py-3')}
          />
          <p className="mt-1 text-end text-caption-1 text-slate-500">{details.length}/300</p>
        </div>

        <div className="flex justify-end gap-2.5 pt-1">
          <Button variant="ghost" onClick={onClose}>
            {tc('cancel')}
          </Button>
          <Button variant="primary" onClick={submit} loading={submitting} disabled={!reason}>
            <Flag className="h-4 w-4" /> {tc('send')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Mustaqil shikoyat tugmasi — auth tekshiradi, dialogni boshqaradi.
 * `variant`: "button" (matnli) yoki "icon" (faqat bayroq).
 */
export function ReportButton({
  targetType,
  targetId,
  variant = 'button',
  className,
  label: labelProp,
}: {
  targetType: ReportTargetType;
  targetId: string;
  variant?: 'button' | 'icon' | 'menu';
  className?: string;
  label?: string;
}) {
  const t = useTranslations('report');
  const label = labelProp ?? t('action');
  const { token } = useAuthStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function trigger() {
    if (!token) {
      toast.error(t('loginRequired'));
      router.push('/login');
      return;
    }
    setOpen(true);
  }

  return (
    <>
      {variant === 'icon' ? (
        <button
          onClick={trigger}
          aria-label={label}
          title={label}
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-ios text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600',
            className,
          )}
        >
          <Flag className="h-4 w-4" />
        </button>
      ) : variant === 'menu' ? (
        <button
          onClick={trigger}
          className={cn(
            'flex w-full items-center gap-2.5 px-3 py-2 text-start text-subhead text-rose-600 hover:bg-rose-50',
            className,
          )}
        >
          <Flag className="h-4 w-4" /> {label}
        </button>
      ) : (
        <button
          onClick={trigger}
          className={cn(
            'inline-flex items-center gap-1.5 text-footnote font-semibold text-slate-600 transition-colors hover:text-rose-600',
            className,
          )}
        >
          <Flag className="h-3.5 w-3.5" /> {label}
        </button>
      )}
      <ReportDialog
        open={open}
        onClose={() => setOpen(false)}
        targetType={targetType}
        targetId={targetId}
      />
    </>
  );
}
