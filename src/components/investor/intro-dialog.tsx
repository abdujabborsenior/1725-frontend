'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { investorsApi, getErrorMessage } from '@/lib/api';

/** Serverdagi minimal uzunlik bilan bir xil — foydalanuvchi 400 ni ko'rmasin. */
const MIN_LENGTH = 30;
const MAX_LENGTH = 1500;

/**
 * Bog'lanish so'rovi oynasi.
 *
 * Xabar MAJBURIY va kamida 30 belgi: "Salom" deb yuborilgan so'rov ikkala
 * tomon uchun ham vaqt isrofi. Shu bitta cheklov kanal sifatini saqlaydi,
 * shuning uchun u UI'da ham, serverda ham bir xil qo'llanadi.
 */
export function IntroDialog({
  open,
  onClose,
  startupId,
  startupTitle,
}: {
  open: boolean;
  onClose: () => void;
  startupId: string;
  startupTitle: string;
}) {
  const t = useTranslations('introDialog');
  const tc = useTranslations('common');
  const qc = useQueryClient();
  const [message, setMessage] = useState('');
  const tooShort = message.trim().length < MIN_LENGTH;

  const { mutate, isPending } = useMutation({
    mutationFn: () => investorsApi.sendIntro(startupId, message.trim()),
    onSuccess: (res) => {
      toast.success(res.message);
      setMessage('');
      onClose();
      void qc.invalidateQueries({ queryKey: ['dealflow'] });
      void qc.invalidateQueries({ queryKey: ['investor-intros'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <Modal open={open} onClose={onClose} title={t('title')}>
      <div className="space-y-4">
        <p className="text-subhead text-slate-600">
          {t.rich('lead', {
            title: startupTitle,
            b: (chunks) => <span className="font-medium text-brand-900">{chunks}</span>,
          })}
        </p>

        <Textarea
          label={t('messageLabel')}
          rows={5}
          maxLength={MAX_LENGTH}
          placeholder={t('placeholder')}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <p className="text-caption-1 text-slate-500">
          {tooShort
            ? t('charsNeeded', { count: MIN_LENGTH - message.trim().length })
            : `${message.trim().length} / ${MAX_LENGTH}`}
        </p>

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose} type="button">
            {tc('cancel')}
          </Button>
          <Button
            className="flex-1"
            onClick={() => mutate()}
            disabled={tooShort || isPending}
            loading={isPending}
            type="button"
          >
            {tc('send')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
