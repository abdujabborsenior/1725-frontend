'use client';

import { useRouter } from '@/i18n/navigation';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import type { PublicProfile } from '@/types';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin, CalendarDays, LinkIcon, MessageCircle, Settings, UserX, Rocket,
} from '@/components/icons';
import { usersApi, startupsApi, chatApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { FollowButton } from '@/components/social/follow-button';
import { VerifiedBadge } from '@/components/social/verified-badge';
import { FounderBadge } from '@/components/social/founder-badge';
import { FounderVoteButton } from '@/components/social/founder-vote-button';
import { ReportButton } from '@/components/reports/report-dialog';
import { FollowListModal } from '@/components/social/follow-list-modal';
import { StartupCard } from '@/components/startups/startup-card';
import { ROLE_BADGE, regionKey } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useDateFormat } from '@/lib/date';
import { useFormatNumber } from '@/lib/format';
import toast from 'react-hot-toast';

export function ProfileClient({ initialProfile }: { initialProfile: PublicProfile | null }) {
  const t = useTranslations('publicProfile');
  const tl = useTranslations('labels');
  const tr = useTranslations('regions');
  const locale = useLocale();
  const { timeAgo, formatMonthYear } = useDateFormat();
  const fmt = useFormatNumber();
  const params = useParams();
  const handle = String(params.handle);
  const router = useRouter();
  const { token } = useAuthStore();
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [listMode, setListMode] = useState<'followers' | 'following' | null>(null);
  const [messaging, setMessaging] = useState(false);

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['profile', handle],
    queryFn: () => usersApi.profile(handle),
    // SSR'dan kelgan boshlang'ich kontent; follow holati background'da yangilanadi
    initialData: initialProfile ?? undefined,
    initialDataUpdatedAt: 0,
  });

  const { data: startups } = useQuery({
    queryKey: ['profile-startups', profile?.id],
    queryFn: () => startupsApi.list({ userId: profile!.id, limit: 8, sort: 'newest' }),
    enabled: !!profile?.id,
  });

  async function message() {
    if (!token) return router.push('/login');
    if (!profile) return;
    setMessaging(true);
    try {
      const conv = await chatApi.direct(profile.id);
      router.push(`/messages/${conv.id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setMessaging(false);
    }
  }

  if (isLoading) {
    // Profil skeletoni — cover + avatar + ism/meta shakli (spinner o'rniga)
    return (
      <div className="mx-auto max-w-4xl" aria-hidden>
        <div className="skeleton mb-4 h-8 w-24 rounded-xl" />
        <div className="overflow-hidden rounded-ios-2xl bg-white surface-window">
          <div className="skeleton h-40 md:h-52" />
          <div className="px-5 pb-6 md:px-8">
            <div className="-mt-12 flex items-end gap-4 md:-mt-16">
              <div className="rounded-full bg-white p-1.5 shadow-card">
                <div className="skeleton h-[104px] w-[104px] rounded-full" />
              </div>
            </div>
            <div className="mt-4 space-y-2.5">
              <div className="skeleton h-5 w-48 rounded-md" />
              <div className="skeleton h-3.5 w-32 rounded-md" />
              <div className="skeleton h-3 w-2/3 rounded-md" />
            </div>
            <div className="mt-5 flex gap-6">
              {[0, 1, 2].map((i) => <div key={i} className="skeleton h-10 w-20 rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="py-28 text-center">
        <UserX className="mx-auto mb-3 h-10 w-10 text-accent-300" />
        <p className="text-title-3 font-bold text-brand-900">{t('notFoundTitle')}</p>
        <p className="mt-1 text-subhead text-slate-500">{t('notFoundText')}</p>
      </div>
    );
  }

  const followers = followerCount ?? profile.followerCount;
  const profileRegionKey = regionKey(profile.region);
  const online =
    profile.lastSeenAt &&
    Date.now() - new Date(profile.lastSeenAt).getTime() < 2 * 60 * 1000;

  return (
    <div className="mx-auto max-w-4xl">
      <BackButton label={t('back')} className="mb-4" fallbackHref="/discover" />
      {/* Cover + header */}
      {/*
        RAMKA (2026-08-31): karta `shadow-card` (0 1px 2px / 4%) bilan
        chizilardi va muqova yo'lagi `bg-slate-100` — ya'ni #F2F2F7, sahifa
        fonining AYNAN o'zi — edi. Natijada muqova sahifaga qo'shilib ketib,
        kartaning boshi umuman ko'rinmasdi. Endi: `surface-window` (hairline
        halqa + ko'tarilish) + `cover-empty` (brend tintidagi sirt) +
        muqova/oq tana chegarasida doimiy hairline.
      */}
      <div className="overflow-hidden rounded-ios-2xl bg-white surface-window">
        <div className="cover-empty relative h-40 md:h-52">
          {profile.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.coverUrl} alt="" fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
          )}
          {/* Muqova ↔ tana chegarasi: rasm oq/och bo'lsa ham o'qiladi */}
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-black/[0.08]" />
        </div>

        <div className="relative z-10 px-5 pb-6 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="-mt-12 flex items-end gap-4 md:-mt-16">
              <div className="rounded-full bg-white p-1.5 shadow-card">
                <Avatar src={profile.avatarUrl} name={profile.fullName} size={104} online={!!online} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {profile.isMe ? (
                <Button variant="outline" size="sm" onClick={() => router.push('/settings')}>
                  <Settings className="h-4 w-4" /> {t('edit')}
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" loading={messaging} onClick={message}>
                    <MessageCircle className="h-4 w-4" /> {t('message')}
                  </Button>
                  <FollowButton
                    userId={profile.id}
                    initialFollowing={profile.isFollowing}
                    onChange={(_, c) => setFollowerCount(c)}
                  />
                  <ReportButton
                    targetType="user"
                    targetId={profile.id}
                    variant="icon"
                    label={t('report')}
                    className="border border-slate-200"
                  />
                </>
              )}
            </div>
          </div>

          {/* Identity */}
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="flex items-center gap-1.5 text-title-1 font-bold tracking-tight text-brand-900">
                {profile.fullName}
                {profile.isVerified && <VerifiedBadge size={21} />}
              </h1>
              <span className={cn('rounded-full px-2.5 py-1 text-caption-1 font-medium', ROLE_BADGE[profile.role])}>
                {tl(`role.${profile.role}`)}
              </span>
              {profile.isFounder && <FounderBadge />}
              {profile.isFollowedBy && !profile.isMe && (
                <span className="rounded-full bg-fill-tertiary px-2.5 py-1 text-caption-1 font-medium text-slate-500">
                  {t('followsYou')}
                </span>
              )}
            </div>
            {profile.username && <p className="text-subhead text-slate-500">@{profile.username}</p>}
            {profile.headline && <p className="mt-2 text-callout text-brand-900">{profile.headline}</p>}
            {profile.bio && (
              <p className="mt-2 max-w-2xl text-subhead leading-relaxed text-slate-500">{profile.bio}</p>
            )}

            {/* Meta */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-footnote text-slate-500">
              {profile.region && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {profileRegionKey ? tr(profileRegionKey) : profile.region}</span>}
              {/* ru: "С нами с августа 2026" — "с" dan keyin oy nomi qaratqich kelishigida */}
              <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {t('memberSince', { date: formatMonthYear(profile.createdAt, { genitive: locale === 'ru' }) })}</span>
              {!online && profile.lastSeenAt && (
                <span>{t('lastSeen', { time: timeAgo(profile.lastSeenAt) })}</span>
              )}
              {online && <span className="flex items-center gap-1 font-semibold text-accent-600"><span className="h-2 w-2 rounded-full bg-accent-500" /> {t('online')}</span>}
            </div>

            {/* Links */}
            {profile.links && profile.links.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.links.map((l) => (
                  <a key={l} href={l} target="_blank" rel="noreferrer"
                    className="tappable inline-flex items-center gap-1 rounded-full bg-accent-50 px-3 py-1.5 text-footnote font-medium text-accent-700 transition-colors hover:bg-accent-100">
                    <LinkIcon className="h-3 w-3" /> {l.replace(/^https?:\/\//, '').slice(0, 28)}
                  </a>
                ))}
              </div>
            )}

            {/* Counts */}
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
              <button onClick={() => setListMode('followers')} className="tappable group text-start">
                <span className="text-title-3 font-semibold tabular-nums text-brand-900 transition-colors duration-200 group-hover:text-accent-700">{fmt(followers)}</span>
                <span className="ms-1 text-subhead text-slate-500 transition-colors duration-200 group-hover:text-accent-700">{t('followers', { count: followers })}</span>
              </button>
              <button onClick={() => setListMode('following')} className="tappable group text-start">
                <span className="text-title-3 font-semibold tabular-nums text-brand-900 transition-colors duration-200 group-hover:text-accent-700">{fmt(profile.followingCount)}</span>
                <span className="ms-1 text-subhead text-slate-500 transition-colors duration-200 group-hover:text-accent-700">{t('following', { count: profile.followingCount })}</span>
              </button>
              {/* Asoschiga ovoz — toggle (o'z profilida faqat hisob) */}
              {profile.isFounder && (
                <FounderVoteButton
                  userId={profile.id}
                  initialVoted={profile.founderVotedByMe}
                  initialCount={profile.founderVoteCount}
                  size="sm"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Their startups */}
      <div className="mt-8">
        <h2 className="ios-section-header">{t('startups')}</h2>
        {startups && startups.data.length > 0 ? (
          <div className="grid-rise grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {startups.data.map((s) => <StartupCard key={s.id} startup={s} />)}
          </div>
        ) : (
          <div className="rounded-ios-2xl bg-white py-12 text-center text-subhead text-slate-500">
            {t('noStartups')}
          </div>
        )}
      </div>

      {listMode && (
        <FollowListModal
          open={!!listMode}
          onClose={() => setListMode(null)}
          userId={profile.id}
          mode={listMode}
        />
      )}
    </div>
  );
}
