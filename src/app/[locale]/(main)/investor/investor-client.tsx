'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
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
import { formatRange } from '@/lib/venture';
import { useDateFormat } from '@/lib/date';
import { useCategoryLabel } from '@/lib/category-labels';
import { regionKey } from '@/lib/constants';
import type { AppLocale } from '@/i18n/routing';

/**
 * Investor kabineti.
 *
 * Uch holat: (1) profil yo'q — ariza formasi, (2) tasdiq kutilmoqda —
 * tinch tushuntirish, (3) tasdiqlangan — lenta va shortlistga kirish.
 * Tasdiq bosqichi ATAYLAB ko'rinadi: u platformaning asoschilarni
 * himoya qilish mexanizmi va buni yashirish noto'g'ri bo'lardi.
 */
export function InvestorClient() {
  const t = useTranslations('investor');
  const tv = useTranslations('venture');
  const tr = useTranslations('regions');
  const locale = useLocale() as AppLocale;
  const { timeAgo } = useDateFormat();
  const categoryLabel = useCategoryLabel();
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

  // Bazada kanonik qiymat (kategoriya nomi, hudud) — ekranda joriy tildagi yorliq
  const regionLabel = (value: string) => {
    const key = regionKey(value);
    return key ? tr(key) : value;
  };
  const list = (values: string[]): string =>
    values.length > 0 ? values.join(', ') : t('criteria.noLimit');

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow={t('eyebrow')}
        title={profile ? t('title.profile') : t('title.join')}
        subtitle={profile ? t('subtitle.profile') : t('subtitle.join')}
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
                    {t('verified')}
                  </p>
                  <p className="mt-0.5 text-footnote text-slate-500">
                    {tv(`investorKind.${profile.kind}`)}
                    {profile.orgName ? ` · ${profile.orgName}` : ''}
                    {profile.lastMatchedAt
                      ? ` · ${t('lastUpdated', { time: timeAgo(profile.lastMatchedAt) })}`
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
                    {t('links.dealflow')}
                  </span>
                  {(data?.newMatches ?? 0) > 0 && (
                    <span className="rounded-full bg-accent-600 px-2 py-0.5 text-caption-2 font-semibold text-white">
                      {data?.newMatches}
                    </span>
                  )}
                  <ChevronRight className="ios-chevron h-4 w-4 text-slate-300" strokeWidth={2.5} />
                </Link>
                <Link href="/investor/dealflow?saved=1" className="ios-row hairline-t">
                  <span className="flex h-8 w-8 items-center justify-center rounded-ios-sm bg-accent-50">
                    <Bookmark className="h-[18px] w-[18px] text-accent-600" />
                  </span>
                  <span className="min-w-0 flex-1 text-body text-brand-900">
                    {t('links.saved')}
                  </span>
                  <span className="text-footnote tabular-nums text-slate-500">
                    {data?.savedCount ?? 0}
                  </span>
                  <ChevronRight className="ios-chevron h-4 w-4 text-slate-300" strokeWidth={2.5} />
                </Link>
                <Link href="/investor/requests" className="ios-row hairline-t">
                  <span className="flex h-8 w-8 items-center justify-center rounded-ios-sm bg-accent-50">
                    <Send className="h-[18px] w-[18px] text-accent-600" />
                  </span>
                  <span className="min-w-0 flex-1 text-body text-brand-900">
                    {t('links.requests')}
                  </span>
                  <ChevronRight className="ios-chevron h-4 w-4 text-slate-300" strokeWidth={2.5} />
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
                    {t('pending.title')}
                  </p>
                  <p className="mt-1 text-footnote text-slate-600">
                    {t('pending.text')}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Joriy kriteriyalar xulosasi */}
          <section className="rounded-ios-lg bg-white p-4">
            <h2 className="text-footnote font-semibold uppercase tracking-wide text-slate-500">
              {t('criteria.title')}
            </h2>
            <dl className="mt-3 space-y-2 text-subhead">
              <Row
                label={t('criteria.sectors')}
                value={list(profile.categories.map((c) => categoryLabel(c)))}
              />
              <Row
                label={t('criteria.check')}
                value={formatRange(profile.checkMin, profile.checkMax, locale)}
              />
              <Row label={t('criteria.regions')} value={list(profile.regions.map(regionLabel))} />
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
              {t('joinNotice')}
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
