'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Rocket } from 'lucide-react';
import { startupsApi } from '@/lib/api';
import { StartupForm } from '@/components/admin/startup-form';

export default function EditStartupPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const id = params.id;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-startup', id],
    queryFn: () => startupsApi.findOne(id),
    enabled: !!id,
  });

  function done() {
    void qc.invalidateQueries({ queryKey: ['admin-startups'] });
    void qc.invalidateQueries({ queryKey: ['admin-startups-count'] });
    void qc.invalidateQueries({ queryKey: ['admin-startups-recent'] });
    void qc.invalidateQueries({ queryKey: ['admin-startup', id] });
    void qc.invalidateQueries({ queryKey: ['startups'] });
    void qc.invalidateQueries({ queryKey: ['startup'] });
    router.push('/admin/startups');
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push('/admin/startups')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-900 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Startaplarga qaytish
      </button>

      {isLoading ? (
        <div className="py-32 flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="h-7 w-7 animate-spin" />
          <p className="text-sm">Yuklanmoqda…</p>
        </div>
      ) : isError || !data ? (
        <div className="py-24 text-center">
          <Rocket className="h-8 w-8 text-slate-300 mx-auto mb-3" />
          <p className="text-brand-900 font-semibold">Startap topilmadi</p>
        </div>
      ) : (
        <>
          <div>
            <h1 className="text-2xl font-black text-brand-900">{data.title}</h1>
            <p className="text-sm text-slate-500 mt-0.5">Startapni tahrirlash</p>
          </div>
          <StartupForm initial={data} onCancel={done} />
        </>
      )}
    </div>
  );
}
