'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Save, KeyRound, Loader2, User as UserIcon } from 'lucide-react';
import { usersApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { UZ_REGIONS, SCHOOL_GRADES, UNIVERSITY_COURSES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const router = useRouter();
  const { user, token, refreshToken, hasHydrated, setAuth } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && !token) router.replace('/login');
  }, [hasHydrated, token, router]);

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => usersApi.me(),
    enabled: !!token,
  });

  // Profile form
  const [form, setForm] = useState({
    fullName: '', age: '', region: '', district: '',
    school: '', grade: '', university: '', course: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (me) {
      setForm({
        fullName: me.fullName ?? '',
        age: me.age != null ? String(me.age) : '',
        region: me.region ?? '',
        district: me.district ?? '',
        school: me.school ?? '',
        grade: me.grade != null ? String(me.grade) : '',
        university: me.university ?? '',
        course: me.course != null ? String(me.course) : '',
      });
    }
  }, [me]);

  // Password form
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);

  const role = me?.role ?? user?.role;
  const isSchool = role === 'school_student';
  const isUniversity = role === 'university_student';

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const payload: Record<string, unknown> = { fullName: form.fullName.trim() };
      if (form.age) payload.age = Number(form.age);
      if (form.region) payload.region = form.region;
      if (isSchool) {
        if (form.district) payload.district = form.district;
        if (form.school) payload.school = form.school;
        if (form.grade) payload.grade = Number(form.grade);
      }
      if (isUniversity) {
        if (form.university) payload.university = form.university;
        if (form.course) payload.course = Number(form.course);
      }
      const updated = await usersApi.updateProfile(payload);
      if (token && refreshToken) setAuth(token, refreshToken, updated);
      toast.success('Profil yangilandi');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword() {
    if (pw.newPassword.length < 8) return toast.error('Yangi parol kamida 8 ta belgi');
    if (pw.newPassword !== pw.confirm) return toast.error('Parollar mos kelmadi');
    setSavingPw(true);
    try {
      const res = await usersApi.changePassword({
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      toast.success(res.message ?? 'Parol o\'zgartirildi');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPw(false);
    }
  }

  if (isLoading || !me) {
    return (
      <div className="max-w-2xl mx-auto py-24 flex justify-center">
        <Loader2 className="h-6 w-6 text-slate-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <button
        onClick={() => router.push('/profile')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-900 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Profil
      </button>

      <h1 className="text-2xl font-bold text-brand-900">Sozlamalar</h1>

      {/* Profile */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <UserIcon className="h-4 w-4" /> Profil ma&apos;lumotlari
        </h2>

        <Input
          label="To'liq ism"
          value={form.fullName}
          onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Yosh"
            type="number"
            value={form.age}
            onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
          />
          <Select
            label="Viloyat"
            value={form.region}
            onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
            options={[{ value: '', label: 'Tanlanmagan' }, ...UZ_REGIONS.map((r) => ({ value: r, label: r }))]}
          />
        </div>

        {isSchool && (
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tuman" value={form.district}
              onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))} />
            <Input label="Maktab" value={form.school}
              onChange={(e) => setForm((f) => ({ ...f, school: e.target.value }))} />
            <Select label="Sinf" value={form.grade}
              onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
              options={[{ value: '', label: '—' }, ...SCHOOL_GRADES.map((g) => ({ value: String(g), label: `${g}-sinf` }))]} />
          </div>
        )}

        {isUniversity && (
          <div className="grid grid-cols-2 gap-4">
            <Input label="Universitet" value={form.university}
              onChange={(e) => setForm((f) => ({ ...f, university: e.target.value }))} />
            <Select label="Kurs" value={form.course}
              onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
              options={[{ value: '', label: '—' }, ...UNIVERSITY_COURSES.map((c) => ({ value: String(c), label: `${c}-kurs` }))]} />
          </div>
        )}

        <Button variant="accent" loading={savingProfile} onClick={saveProfile}>
          <Save className="h-4 w-4" /> Saqlash
        </Button>
      </div>

      {/* Email (read-only) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Email</h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-brand-900">{me.email}</span>
          {me.isEmailVerified && (
            <span className="text-xs font-semibold text-accent-700">Tasdiqlangan ✓</span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-1">Emailni o&apos;zgartirib bo&apos;lmaydi</p>
      </div>

      {/* Password */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <KeyRound className="h-4 w-4" /> Parolni o&apos;zgartirish
        </h2>
        <Input
          label="Joriy parol"
          type="password"
          value={pw.currentPassword}
          onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Yangi parol"
            type="password"
            hint="Kamida 8 ta belgi"
            value={pw.newPassword}
            onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))}
          />
          <Input
            label="Tasdiqlash"
            type="password"
            value={pw.confirm}
            onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
          />
        </div>
        <Button
          variant="primary"
          loading={savingPw}
          disabled={!pw.currentPassword || !pw.newPassword}
          onClick={savePassword}
        >
          <KeyRound className="h-4 w-4" /> Parolni yangilash
        </Button>
      </div>
    </div>
  );
}
