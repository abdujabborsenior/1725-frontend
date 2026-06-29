'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2, MapPin, CalendarDays, LinkIcon, MessageCircle, Settings, UserX, Rocket,
} from 'lucide-react';
import { usersApi, startupsApi, chatApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { FollowButton } from '@/components/social/follow-button';
import { ReportButton } from '@/components/reports/report-dialog';
import { FollowListModal } from '@/components/social/follow-list-modal';
import { StartupCard } from '@/components/startups/startup-card';
import { ROLE_LABEL, ROLE_BADGE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function ProfilePage() {
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
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="py-28 text-center">
        <UserX className="mx-auto mb-3 h-10 w-10 text-slate-300" />
        <p className="text-lg font-bold text-brand-900">Foydalanuvchi topilmadi</p>
        <p className="mt-1 text-sm text-slate-500">Bunday username mavjud emas yoki hisob faol emas.</p>
      </div>
    );
  }

  const followers = followerCount ?? profile.followerCount;
  const online =
    profile.lastSeenAt &&
    Date.now() - new Date(profile.lastSeenAt).getTime() < 2 * 60 * 1000;

  return (
    <div className="mx-auto max-w-4xl animate-fade-in">
      <BackButton label="Ortga" className="mb-4" fallbackHref="/discover" />
      {/* Cover + header */}
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
        <div className="relative h-40 bg-gradient-emerald-iris md:h-52">
          {profile.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.coverUrl} alt="" className="h-full w-full object-cover" />
          )}
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
                  <Settings className="h-4 w-4" /> Profilni tahrirlash
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" loading={messaging} onClick={message}>
                    <MessageCircle className="h-4 w-4" /> Xabar
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
                    label="Foydalanuvchi ustidan shikoyat"
                    className="border border-slate-200"
                  />
                </>
              )}
            </div>
          </div>

          {/* Identity */}
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-brand-900">{profile.fullName}</h1>
              <span className={cn('rounded-md border px-2 py-0.5 text-[11px] font-semibold', ROLE_BADGE[profile.role])}>
                {ROLE_LABEL[profile.role]}
              </span>
              {profile.isFollowedBy && !profile.isMe && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                  Sizni kuzatadi
                </span>
              )}
            </div>
            {profile.username && <p className="text-sm text-slate-500">@{profile.username}</p>}
            {profile.headline && <p className="mt-2 text-sm font-medium text-brand-800">{profile.headline}</p>}
            {profile.bio && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{profile.bio}</p>}

            {/* Meta */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              {profile.region && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {profile.region}</span>}
              <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {format(new Date(profile.createdAt), 'MMM yyyy')} dan beri</span>
              {!online && profile.lastSeenAt && (
                <span>oxirgi faollik {formatDistanceToNow(new Date(profile.lastSeenAt), { addSuffix: true })}</span>
              )}
              {online && <span className="flex items-center gap-1 font-semibold text-accent-600"><span className="h-2 w-2 rounded-full bg-accent-500" /> onlayn</span>}
            </div>

            {/* Links */}
            {profile.links && profile.links.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.links.map((l) => (
                  <a key={l} href={l} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-surface-soft px-3 py-1 text-xs font-medium text-iris-700 hover:border-iris-300">
                    <LinkIcon className="h-3 w-3" /> {l.replace(/^https?:\/\//, '').slice(0, 28)}
                  </a>
                ))}
              </div>
            )}

            {/* Counts */}
            <div className="mt-4 flex items-center gap-6">
              <button onClick={() => setListMode('followers')} className="group text-left">
                <span className="text-lg font-black text-brand-900">{followers.toLocaleString('uz')}</span>
                <span className="ml-1 text-sm text-slate-500 group-hover:text-brand-900">obunachi</span>
              </button>
              <button onClick={() => setListMode('following')} className="group text-left">
                <span className="text-lg font-black text-brand-900">{profile.followingCount.toLocaleString('uz')}</span>
                <span className="ml-1 text-sm text-slate-500 group-hover:text-brand-900">obuna</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Their startups */}
      <div className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-brand-900">
          <Rocket className="h-5 w-5 text-accent-600" /> Startaplari
        </h2>
        {startups && startups.data.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {startups.data.map((s) => <StartupCard key={s.id} startup={s} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-surface-soft py-12 text-center text-sm text-slate-500">
            Hali startaplar yo‘q
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
