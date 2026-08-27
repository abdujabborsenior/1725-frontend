'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Bookmark,
  Briefcase,
  CheckCircleFill,
  ChevronRight,
  Clock,
  Send,
  ShieldCheck,
} from '@/components/icons';
import { investorsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { PageHeader } from '@/components/ui/page-header';
import { InvestorProfileForm } from '@/components/investor/investor-profile-form';
import { ListRowSkeleton } from '@/components/ui/skeleton';
import { INVESTOR_KIND_LABEL, formatRange } from '@/lib/venture';
import { timeAgo } from '@/lib/date';

/**
 * Investor kabineti.
 *
 * Uch holat: (1) profil yo'q — ariza formasi, (2) tasdiq kutilmoqda —
 * tinch tushuntirish, (3) tasdiqlangan — lenta va shortlistga kirish.
 * Tasdiq bosqichi ATAYLAB ko'rinadi: u platformaning asoschilarni
 * himoya qilish mexanizmi va buni yashirish noto'g'ri bo'lardi.
 */
export default function InvestorPage() {
  const router = useRouter();
  const { token, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace(`/register?next=${encodeURIComponent('/investor')}`);
    }
  }, [hasHydrated, token, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['investor-me'],
    queryFn: () => investorsApi.me(),
    enabled: !!token,
  });

  if (hasHydrated && !token) return null;

  const profile = data?.profile ?? null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="Investor kabineti"
        title={profile ? 'Kriteriyalaringiz' : 'Investor sifatida qo‘shiling'}
        subtitle={
          profile
            ? 'Bu ma’lumot asosida sizga mos loyihalar tanlanadi.'
            : 'Nimaga qiziqishingizni bir marta yozasiz — mos loyihalar o‘zi topib keladi.'
        }
      />

      {isLoading && (
        <div className="space-y-3">
          <ListRowSkeleton />
          <ListRowSkeleton />
        </div>
      )}

      {!isLoading && profile && (
        <>
          {/* Holat bandi */}
          {profile.isVerified ? (
            <section className="overflow-hidden rounded-ios-lg bg-white">
              <div className="flex items-start gap-3 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-ios-sm bg-accent-50">
                  <CheckCircleFill className="h-5 w-5 text-accent-600" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-body font-medium text-brand-900">
                    Profilingiz tasdiqlangan
                  </p>
                  <p className="mt-0.5 text-footnote text-slate-500">
                    {INVESTOR_KIND_LABEL[profile.kind]}
                    {profile.orgName ? ` · ${profile.orgName}` : ''}
                    {profile.lastMatchedAt
                      ? ` · oxirgi yangilanish ${timeAgo(profile.lastMatchedAt)}`
                      : ''}
                  </p>
                </div>
              </div>

              <div className="hairline-t">
                <Link href="/investor/dealflow" className="ios-row">
                  <span className="flex h-8 w-8 items-center justify-center rounded-ios-sm bg-indigo-50">
                    <Briefcase className="h-[18px] w-[18px] text-indigo-600" />
                  </span>
                  <span className="min-w-0 flex-1 text-body text-brand-900">
                    Loyihalar lentasi
                  </span>
                  {(data?.newMatches ?? 0) > 0 && (
                    <span className="rounded-full bg-accent-600 px-2 py-0.5 text-caption-2 font-semibold text-white">
                      {data?.newMatches}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-slate-300" strokeWidth={2.5} />
                </Link>
                <Link href="/investor/dealflow?saved=1" className="ios-row hairline-t">
                  <span className="flex h-8 w-8 items-center justify-center rounded-ios-sm bg-fill-tertiary">
                    <Bookmark className="h-[18px] w-[18px] text-slate-600" />
                  </span>
                  <span className="min-w-0 flex-1 text-body text-brand-900">
                    Saqlanganlar
                  </span>
                  <span className="text-footnote tabular-nums text-slate-400">
                    {data?.savedCount ?? 0}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300" strokeWidth={2.5} />
                </Link>
                <Link href="/investor/requests" className="ios-row hairline-t">
                  <span className="flex h-8 w-8 items-center justify-center rounded-ios-sm bg-fill-tertiary">
                    <Send className="h-[18px] w-[18px] text-slate-600" />
                  </span>
                  <span className="min-w-0 flex-1 text-body text-brand-900">
                    Yuborilgan so&apos;rovlar
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300" strokeWidth={2.5} />
                </Link>
              </div>
            </section>
          ) : (
            <section className="rounded-ios-lg bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-ios-sm bg-amber-50">
                  <Clock className="h-[18px] w-[18px] text-amber-600" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-body font-medium text-brand-900">
                    Tasdiq kutilmoqda
                  </p>
                  <p className="mt-1 text-footnote text-slate-600">
                    Arizangiz qabul qilindi. Loyihalar lentasi profil
                    tasdiqlangandan so&apos;ng ochiladi — bu qoida yosh
                    asoschilarni soxta so&apos;rovlardan himoya qiladi.
                    Kriteriyalaringizni hozir ham tahrirlashingiz mumkin.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Joriy kriteriyalar xulosasi */}
          <section className="rounded-ios-lg bg-white p-4">
            <h2 className="text-footnote font-semibold uppercase tracking-wide text-slate-400">
              Hozirgi kriteriyalar
            </h2>
            <dl className="mt-3 space-y-2 text-subhead">
              <Row label="Sohalar" value={list(profile.categories)} />
              <Row label="Chek hajmi" value={formatRange(profile.checkMin, profile.checkMax)} />
              <Row label="Hududlar" value={list(profile.regions)} />
            </dl>
          </section>
        </>
      )}

      {!isLoading && !profile && (
        <section className="rounded-ios-lg bg-white p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-ios-sm bg-indigo-50">
              <ShieldCheck className="h-[18px] w-[18px] text-indigo-600" />
            </span>
            <p className="text-footnote text-slate-600">
              Profil yuborilgandan so&apos;ng superadmin uni ko&apos;rib
              chiqadi. Tasdiqdan keyin kriteriyangizga mos loyihalar
              lentasi ochiladi va yangi loyiha chiqqanda xabar beramiz.
            </p>
          </div>
        </section>
      )}

      {!isLoading && <InvestorProfileForm initial={profile} />}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="text-right text-brand-900">{value}</dd>
    </div>
  );
}

function list(values: string[]): string {
  return values.length > 0 ? values.join(', ') : 'Cheklov yo‘q';
}
