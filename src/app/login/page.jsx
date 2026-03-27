'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Layers, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '@/store/auth.store';
import { useRedirectIfAuth } from '@/hooks/useAuth';

const demoAccounts = [
    { role: 'Owner', email: 'alice@collabify.io', password: 'Password1', color: '#4F46E5', initials: 'AJ' },
    { role: 'Admin', email: 'bob@collabify.io', password: 'Password1', color: '#7C3AED', initials: 'BS' },
    { role: 'Member', email: 'carol@collabify.io', password: 'Password1', color: '#DB2777', initials: 'CW' },
    { role: 'Viewer', email: 'eve@collabify.io', password: 'Password1', color: '#D97706', initials: 'ED' },
];

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoading } = useAuthStore();
    const { isLoading: isCheckingAuth } = useRedirectIfAuth();

    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [selectedDemo, setSelectedDemo] = useState('');

    const fillDemo = (acc) => {
        setForm({ email: acc.email, password: acc.password });
        setSelectedDemo(acc.email);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.email || !form.password) {
            setError('Please enter your email and password.');
            return;
        }
        try {
            const user = await login(form.email, form.password);
            toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`);
            router.push('/dashboard');
        } catch (err) {
            setError(err?.message || 'Invalid email or password.');
        }
    };

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Layers className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Collabify</h1>
                    <p className="text-gray-500 mt-1 text-sm">Real-time team collaboration</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

                    {/* Header */}
                    <div className="px-8 pt-8 pb-6">
                        <h2 className="text-xl font-bold text-gray-900">Welcome back</h2>
                        <p className="text-sm text-gray-500 mt-1">Sign in to your account to continue</p>
                    </div>

                    {/* Form */}
                    <div className="px-8 pb-6 space-y-4">

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                                <span className="w-4 h-4 shrink-0">⚠️</span>
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setSelectedDemo(''); }}
                                placeholder="you@example.com"
                                autoComplete="email"
                                onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
                                className="input-base"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
                                    className="input-base pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(s => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="btn-primary w-full py-3 mt-2"
                        >
                            {isLoading
                                ? <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                                : 'Sign In'
                            }
                        </button>
                    </div>

                    {/* Demo accounts */}
                    <div className="px-8 pb-8">
                        <div className="border-t border-gray-100 pt-6">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center mb-3">
                                Demo Accounts — password: <span className="text-indigo-600 font-mono">Password1</span>
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {demoAccounts.map(acc => (
                                    <button
                                        key={acc.email}
                                        type="button"
                                        onClick={() => fillDemo(acc)}
                                        className="relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all hover:shadow-sm"
                                        style={{
                                            background: selectedDemo === acc.email ? `${acc.color}12` : '#FAFAFA',
                                            borderColor: selectedDemo === acc.email ? `${acc.color}50` : '#E5E7EB',
                                        }}
                                    >
                                        {selectedDemo === acc.email && (
                                            <span className="absolute top-1.5 right-1.5 text-xs">✓</span>
                                        )}
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                                            style={{ background: acc.color }}
                                        >
                                            {acc.initials}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-gray-800 capitalize">{acc.role}</p>
                                            <p className="text-[10px] text-gray-400 truncate">{acc.email}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-600">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="text-indigo-600 font-semibold hover:text-indigo-700">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">
                    Collabify © {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}