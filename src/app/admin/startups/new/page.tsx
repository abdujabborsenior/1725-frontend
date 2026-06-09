'use client';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { StartupForm } from '@/components/admin/startup-form';

export default function NewStartupPage() {
  const router = useRouter();
  const qc = useQueryClient();

  function done() {
    void qc.invalidateQueries({ queryKey: ['admin-startups'] });
    void qc.invalidateQueries({ queryKey: ['admin-startups-count'] });
    void qc.invalidateQueries({ queryKey: ['admin-startups-recent'] });
    void qc.invalidateQueries({ queryKey: ['startups'] });
    router.push('/admin/startups');
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-900 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Orqaga
      </button>

      <div>
        <h1 className="text-2xl font-black text-brand-900">Yangi startap</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Mahsulot ma&apos;lumotlari, platformalar va vizuallarni kiriting
        </p>
      </div>

      <StartupForm onCancel={done} />
    </div>
  );
}
