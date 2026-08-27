'use client';

import { useState } from 'react';
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
    <Modal open={open} onClose={onClose} title="Bog'lanish so'rovi">
      <div className="space-y-4">
        <p className="text-subhead text-slate-600">
          <span className="font-medium text-brand-900">{startupTitle}</span>{' '}
          asoschisiga so&apos;rov yuboriladi. U qabul qilsa — suhbat ochiladi
          va bu xabar birinchi bo&apos;lib ko&apos;rinadi.
        </p>

        <Textarea
          label="Xabaringiz"
          rows={5}
          maxLength={MAX_LENGTH}
          placeholder="Nima uchun qiziqayotganingizni va nima taklif qilishingizni yozing. Aniq gap javob olish ehtimolini keskin oshiradi."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <p className="text-caption-1 text-slate-500">
          {tooShort
            ? `Yana ${MIN_LENGTH - message.trim().length} ta belgi kerak`
            : `${message.trim().length} / ${MAX_LENGTH}`}
        </p>

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose} type="button">
            Bekor qilish
          </Button>
          <Button
            className="flex-1"
            onClick={() => mutate()}
            disabled={tooShort || isPending}
            loading={isPending}
            type="button"
          >
            Yuborish
          </Button>
        </div>
      </div>
    </Modal>
  );
}
