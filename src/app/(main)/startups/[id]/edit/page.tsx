'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, PencilLine, Trash2 } from '@/components/icons';
import { startupsApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { StartupForm } from '@/components/startups/startup-form';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import toast from 'react-hot-toast';

/** O'z startapini tahrirlash — faqat egasi (yoki admin) uchun. */
export default function EditStartupPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token, user, hasHydrated } = useAuthStore();
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace(`/login?next=${encodeURIComponent(`/startups/${id}/edit`)}`);
    }
  }, [hasHydrated, token, id, router]);

  const { data: startup, isLoading } = useQuery({
    queryKey: ['startup', id],
    queryFn: () => startupsApi.findOne(id),
    enabled: !!token,
  });

  const { mutate: remove, isPending: removing } = useMutation({
    mutationFn: () => startupsApi.remove(id),
    onSuccess: () => {
      toast.success("Startap o'chirildi");
      router.push('/startups');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const isOwner =
    !!user && !!startup &&
    (startup.createdById === user.id ||
      user.role === 'superadmin' || user.role === 'analyzer');

  if (!hasHydrated || !token || isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-6 w-32 rounded bg-slate-100" />
        <div className="h-10 w-64 rounded bg-slate-100" />
        <div className="h-96 rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (!startup || !isOwner) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-500">
          {startup ? "Bu startapni tahrirlash huquqingiz yo'q" : 'Startap topilmadi'}
        </p>
        <Button variant="ghost" onClick={() => router.back()} className="mt-4">
          Orqaga
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-subhead text-slate-500 hover:text-brand-900 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform" />
        Orqaga
      </button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-accent-700">
            Tahrirlash
          </p>
          <h1 className="mt-1 line-clamp-2 text-large-title font-bold tracking-tight text-brand-900">
            {startup.title}
          </h1>
        </div>
        <button
          onClick={() => setConfirmOpen(true)}
          className="tappable flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-rose-50 px-3.5 text-footnote font-medium text-rose-600"
        >
          <Trash2 className="h-3.5 w-3.5" /> O&apos;chirish
        </button>
      </div>

      <StartupForm initial={startup} />

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Startapni o'chirish">
        <div className="space-y-4">
          <p className="text-subhead text-slate-600 leading-relaxed">
            <span className="font-semibold text-brand-900">&ldquo;{startup.title}&rdquo;</span>{' '}
            butunlay o&apos;chiriladi — buni ortga qaytarib bo&apos;lmaydi. Davom etasizmi?
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Bekor qilish
            </Button>
            <Button variant="danger" loading={removing} onClick={() => remove()}>
              <Trash2 className="h-4 w-4" /> O&apos;chirish
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
