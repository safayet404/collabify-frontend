'use client';

import { useState, useRef } from 'react';
import { Camera, Save, Loader2, Key, Bell, Palette, Check, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import useAuthStore from '@/store/auth.store';
import { useRequireAuth } from '@/hooks/useAuth';
import { UserAvatar } from '@/app/dashboard/layout';
import AppLayout from '@/app/dashboard/layout';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, updateUser, fetchMe } = useAuthStore();
  const { isLoading } = useRequireAuth();

  const [activeTab, setActiveTab] = useState('profile');

  if (isLoading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account settings and preferences</p>
        </div>

        {/* Profile hero */}
        <ProfileHero user={user} onUpdate={async (updates) => { updateUser(updates); await fetchMe(); }} />

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'profile',  label: 'Profile',   icon: <Check size={14} /> },
            { id: 'password', label: 'Password',  icon: <Key size={14} /> },
            { id: 'notifications', label: 'Notifications', icon: <Bell size={14} /> },
            { id: 'appearance',    label: 'Appearance',    icon: <Palette size={14} /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab.id
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              )}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'profile'  && <ProfileForm       user={user} onSaved={fetchMe} />}
        {activeTab === 'password' && <PasswordForm />}
        {activeTab === 'notifications' && <NotificationPrefs user={user} onSaved={fetchMe} />}
        {activeTab === 'appearance'    && <AppearancePrefs  user={user} onSaved={fetchMe} />}
      </div>
    </AppLayout>
  );
}

// ── Profile Hero ──────────────────────────────────────────────
function ProfileHero({ user, onUpdate }) {
  const fileRef   = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('avatar', file);
      const res = await api.post('/auth/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      onUpdate({ avatar: res.data.user.avatar });
      toast.success('Avatar updated');
    } catch { toast.error('Failed to upload'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center gap-5">
        <div className="relative group">
          <UserAvatar user={user} size="lg" />
          <button onClick={() => fileRef.current?.click()}
            className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {uploading
              ? <Loader2 size={16} className="text-white animate-spin" />
              : <Camera size={16} className="text-white" />
            }
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <p className="text-xs text-gray-400 mt-1">
            Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '—'}
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-gray-400 mb-1">Click avatar to change photo</p>
        </div>
      </div>
    </div>
  );
}

// ── Profile Form ──────────────────────────────────────────────
function ProfileForm({ user, onSaved }) {
  const [form,   setForm]   = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.patch('/auth/profile', form);
      useAuthStore.getState().updateUser(res.data.user);
      onSaved();
      toast.success('Profile updated');
    } catch (err) { toast.error(err?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white">Personal Information</h3>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Display Name</label>
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Your name" className="input-base" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Bio</label>
        <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
          placeholder="Tell your team a bit about yourself..." rows={3}
          className="input-base resize-none" maxLength={200} />
        <p className="text-xs text-gray-400 text-right mt-1">{form.bio.length}/200</p>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
        <input value={user?.email || ''} disabled
          className="input-base opacity-60 cursor-not-allowed" />
        <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
      </div>
      <button onClick={save} disabled={saving} className="btn-primary text-sm">
        {saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : <><Save size={13} /> Save Changes</>}
      </button>
    </div>
  );
}

// ── Password Form ─────────────────────────────────────────────
function PasswordForm() {
  const [form,   setForm]   = useState({ currentPassword: '', password: '', confirmPassword: '' });
  const [show,   setShow]   = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const save = async () => {
    setErrors({});
    if (form.password !== form.confirmPassword) { setErrors({ confirm: 'Passwords do not match' }); return; }
    if (form.password.length < 8) { setErrors({ new: 'Minimum 8 characters' }); return; }
    setSaving(true);
    try {
      await api.patch('/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.password });
      toast.success('Password changed successfully');
      setForm({ currentPassword: '', password: '', confirmPassword: '' });
    } catch (err) { toast.error(err?.message || 'Failed to change password'); }
    finally { setSaving(false); }
  };

  const PasswordInput = ({ field, label, showKey }) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div className="relative">
        <input
          type={show[showKey] ? 'text' : 'password'}
          value={form[field]}
          onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
          autoComplete="new-password"
          className={cn('input-base pr-10', errors[showKey] && 'border-red-400')}
        />
        <button type="button" onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {errors[showKey] && <p className="text-xs text-red-500 mt-1">{errors[showKey]}</p>}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white">Change Password</h3>
      <PasswordInput field="currentPassword" label="Current Password"   showKey="current" />
      <PasswordInput field="password"        label="New Password"       showKey="new" />
      <PasswordInput field="confirmPassword" label="Confirm New Password" showKey="confirm" />
      <button onClick={save} disabled={saving} className="btn-primary text-sm">
        {saving ? <><Loader2 size={13} className="animate-spin" /> Updating...</> : <><Key size={13} /> Update Password</>}
      </button>
    </div>
  );
}

// ── Notification Preferences ──────────────────────────────────
function NotificationPrefs({ user, onSaved }) {
  const [prefs,  setPrefs]  = useState(user?.preferences?.notifications || { email: true, inApp: true, cardDue: true, mentions: true });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch('/auth/profile', { preferences: { notifications: prefs } });
      useAuthStore.getState().updateUser({ preferences: { ...user?.preferences, notifications: prefs } });
      toast.success('Notification preferences saved');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const Toggle = ({ field, label, desc }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <button onClick={() => setPrefs(p => ({ ...p, [field]: !p[field] }))}
        className={cn('w-11 h-6 rounded-full transition-colors relative shrink-0', prefs[field] ? 'bg-indigo-600' : 'bg-gray-300')}>
        <span className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', prefs[field] ? 'translate-x-5' : 'translate-x-0.5')} />
      </button>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
      <Toggle field="inApp"    label="In-app notifications" desc="Show notifications inside Collabify" />
      <Toggle field="email"    label="Email notifications"  desc="Receive updates via email" />
      <Toggle field="mentions" label="Mentions"             desc="When someone @mentions you" />
      <Toggle field="cardDue"  label="Due date reminders"   desc="Get reminded before cards are due" />
      <button onClick={save} disabled={saving} className="btn-primary text-sm mt-4">
        {saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : 'Save Preferences'}
      </button>
    </div>
  );
}

// ── Appearance Preferences ────────────────────────────────────
function AppearancePrefs({ user, onSaved }) {
  const { setTheme, theme } = require('next-themes').useTheme?.() || {};
  const [saving, setSaving] = useState(false);

  const save = async (newTheme) => {
    setSaving(true);
    try {
      setTheme?.(newTheme);
      await api.patch('/auth/profile', { preferences: { theme: newTheme } });
      toast.success('Theme updated');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const themes = [
    { id: 'light',  label: 'Light',  desc: 'Clean and bright', preview: 'bg-white border-2 border-gray-200' },
    { id: 'dark',   label: 'Dark',   desc: 'Easy on the eyes', preview: 'bg-gray-900 border-2 border-gray-700' },
    { id: 'system', label: 'System', desc: 'Follows OS setting', preview: 'bg-gradient-to-r from-white to-gray-900 border-2 border-gray-300' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Appearance</h3>
      <div className="grid grid-cols-3 gap-3">
        {themes.map(t => (
          <button key={t.id} onClick={() => save(t.id)}
            className={cn(
              'relative p-3 rounded-xl border-2 text-center transition-all',
              theme === t.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            )}>
            <div className={cn('w-full h-12 rounded-lg mb-2 mx-auto', t.preview)} />
            <p className="text-xs font-semibold text-gray-900 dark:text-white">{t.label}</p>
            <p className="text-[10px] text-gray-400">{t.desc}</p>
            {theme === t.id && (
              <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                <Check size={10} className="text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
