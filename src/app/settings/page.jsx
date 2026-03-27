'use client';

import { useState } from 'react';
import {
  Settings, Bell, Shield, Palette, User,
  LogOut, Trash2, Loader2, Check, Moon, Sun, Monitor
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import useAuthStore from '@/store/auth.store';
import AppLayout from '@/app/dashboard/layout';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout, updateUser } = useAuthStore();
  const [activeSection, setActiveSection] = useState('appearance');

  const nav = [
    { id: 'appearance',    label: 'Appearance',    icon: <Palette size={15} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
    { id: 'privacy',       label: 'Privacy',       icon: <Shield size={15} /> },
    { id: 'account',       label: 'Account',       icon: <User size={15} /> },
  ];

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings size={22} /> Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account and application preferences</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar nav */}
          <nav className="w-48 shrink-0 space-y-1">
            {nav.map(item => (
              <button key={item.id} onClick={() => setActiveSection(item.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                  activeSection === item.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}>
                {item.icon} {item.label}
              </button>
            ))}
            <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
            <button
              onClick={async () => { await logout(); router.push('/login'); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {activeSection === 'appearance' && <AppearanceSection theme={theme} setTheme={setTheme} />}
            {activeSection === 'notifications' && <NotificationsSection user={user} updateUser={updateUser} />}
            {activeSection === 'privacy' && <PrivacySection />}
            {activeSection === 'account' && <AccountSection user={user} router={router} logout={logout} />}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// ── Appearance ────────────────────────────────────────────────
function AppearanceSection({ theme, setTheme }) {
  const themes = [
    { id: 'light',  label: 'Light',  icon: <Sun size={20} />,     desc: 'Clean white interface' },
    { id: 'dark',   label: 'Dark',   icon: <Moon size={20} />,    desc: 'Easy on the eyes' },
    { id: 'system', label: 'System', icon: <Monitor size={20} />, desc: 'Follows your OS' },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader title="Appearance" desc="Customize how Collabify looks for you" />

      <Card title="Theme">
        <div className="grid grid-cols-3 gap-3">
          {themes.map(t => (
            <button key={t.id} onClick={() => setTheme(t.id)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                theme === t.id
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-600 dark:text-gray-400'
              )}>
              {t.icon}
              <span className="text-sm font-semibold">{t.label}</span>
              <span className="text-[10px] text-gray-400 text-center">{t.desc}</span>
              {theme === t.id && (
                <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Check size={11} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Notifications ─────────────────────────────────────────────
function NotificationsSection({ user, updateUser }) {
  const [prefs,  setPrefs]  = useState(user?.preferences?.notifications || {
    email: true, inApp: true, cardDue: true, mentions: true
  });
  const [saving, setSaving] = useState(false);

  const togglePref = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const save = async () => {
    setSaving(true);
    try {
      const api = (await import('@/lib/axios')).default;
      await api.patch('/auth/profile', { preferences: { notifications: prefs } });
      updateUser({ preferences: { ...user?.preferences, notifications: prefs } });
      toast.success('Notification settings saved');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const items = [
    { key: 'inApp',    label: 'In-app notifications',  desc: 'Show bell icon and popup notifications' },
    { key: 'email',    label: 'Email notifications',   desc: 'Receive updates to your email address' },
    { key: 'mentions', label: '@Mention alerts',       desc: 'When someone mentions you in a comment' },
    { key: 'cardDue',  label: 'Due date reminders',    desc: 'Alerts before your assigned cards are due' },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader title="Notifications" desc="Control how and when you receive notifications" />
      <Card title="Notification Preferences">
        <div className="space-y-1">
          {items.map(item => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <button onClick={() => togglePref(item.key)}
                className={cn('w-11 h-6 rounded-full transition-colors relative shrink-0 ml-4',
                  prefs[item.key] ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                )}>
                <span className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                  prefs[item.key] ? 'translate-x-5' : 'translate-x-0.5'
                )} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={save} disabled={saving} className="btn-primary text-sm mt-4">
          {saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : 'Save Settings'}
        </button>
      </Card>
    </div>
  );
}

// ── Privacy ───────────────────────────────────────────────────
function PrivacySection() {
  return (
    <div className="space-y-5">
      <SectionHeader title="Privacy & Security" desc="Manage your data and privacy preferences" />
      <Card title="Data & Privacy">
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
          <p>Collabify stores your data securely and never shares it with third parties.</p>
          <ul className="space-y-2 text-xs text-gray-500">
            <li className="flex items-center gap-2"><Check size={13} className="text-green-500" /> End-to-end encrypted in transit</li>
            <li className="flex items-center gap-2"><Check size={13} className="text-green-500" /> Data stored in MongoDB Atlas</li>
            <li className="flex items-center gap-2"><Check size={13} className="text-green-500" /> JWT token authentication</li>
            <li className="flex items-center gap-2"><Check size={13} className="text-green-500" /> Activity logs for audit trail</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

// ── Account ───────────────────────────────────────────────────
function AccountSection({ user, router, logout }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete your account? This action cannot be undone.')) return;
    if (!confirm('Are you absolutely sure? All your data will be lost.')) return;
    setDeleting(true);
    try {
      const api = (await import('@/lib/axios')).default;
      await api.delete('/auth/account');
      await logout();
      router.push('/login');
      toast.success('Account deleted');
    } catch { toast.error('Failed to delete account'); setDeleting(false); }
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="Account" desc="Manage your account details and data" />

      <Card title="Account Information">
        <div className="space-y-3 text-sm">
          <InfoRow label="Name"   value={user?.name} />
          <InfoRow label="Email"  value={user?.email} />
          <InfoRow label="Member Since" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'} />
          <InfoRow label="Email Verified" value={user?.isEmailVerified ? '✅ Verified' : '❌ Not verified'} />
        </div>
      </Card>

      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">Danger Zone</h3>
        <p className="text-xs text-red-600 dark:text-red-400 mb-3">
          Once you delete your account, there is no going back. All your workspaces, boards, and cards will be permanently removed.
        </p>
        <button onClick={handleDelete} disabled={deleting}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-white dark:bg-gray-800 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
          {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          Delete Account
        </button>
      </div>
    </div>
  );
}

// ── Shared components ─────────────────────────────────────────
function SectionHeader({ title, desc }) {
  return (
    <div className="mb-2">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
      <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-gray-500 text-xs font-medium">{label}</span>
      <span className="text-gray-900 dark:text-white text-xs font-medium">{value}</span>
    </div>
  );
}
