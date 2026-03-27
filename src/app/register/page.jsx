'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Layers, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '@/store/auth.store';
import { useRedirectIfAuth } from '@/hooks/useAuth';

const passwordRules = [
    { id: 'length', label: 'At least 8 characters', test: p => p.length >= 8 },
    { id: 'upper', label: 'One uppercase letter', test: p => /[A-Z]/.test(p) },
    { id: 'lower', label: 'One lowercase letter', test: p => /[a-z]/.test(p) },
    { id: 'number', label: 'One number', test: p => /\d/.test(p) },
];

export default function RegisterPage() {
    const router = useRouter();
    const { register, isLoading } = useAuthStore();
    const { isLoading: isCheckingAuth } = useRedirectIfAuth();

    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [touched, setTouched] = useState({});

    const update = (field, value) => {
        setForm(f => ({ ...f, [field]: value }));
        setTouched(t => ({ ...t, [field]: true }));
        setError('');
    };

    const passwordStrength = () => {
        const passed = passwordRules.filter(r => r.test(form.password)).length;
        if (passed <= 1) return { label: 'Weak', color: '#EF4444', width: '25%' };
        if (passed === 2) return { label: 'Fair', color: '#F59E0B', width: '50%' };
        if (passed === 3) return { label: 'Good', color: '#3B82F6', width: '75%' };
        return { label: 'Strong', color: '#10B981', width: '100%' };
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        setError('');

        if (!form.name.trim()) return setError('Name is required.');
        if (!form.email.trim()) return setError('Email is required.');
        if (form.password.length < 8) return setError('Password must be at least 8 characters.');
        if (!/[A-Z]/.test(form.password)) return setError('Password must contain an uppercase letter.');
        if (!/\d/.test(form.password)) return setError('Password must contain a number.');
        if (form.password !== form.confirmPassword) return setError('Passwords do not match.');

        try {
            const user = await register(form.name.trim(), form.email.trim(), form.password);
            toast.success(`Welcome to Collabify, ${user.name.split(' ')[0]}! 🎉`);
            router.push('/dashboard');
        } catch (err) {
            setError(err?.message || 'Registration failed. Please try again.');
        }
    };

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const strength = form.password ? passwordStrength() : null;

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">


                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Layers className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Collabify</h1>
                    <p className="text-gray-500 mt-1 text-sm">Real-time team collaboration</p>
                </div>


                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

                    <div className="px-8 pt-8 pb-6">
                        <h2 className="text-xl font-bold text-gray-900">Create your account</h2>
                        <p className="text-sm text-gray-500 mt-1">Start collaborating with your team today</p>
                    </div>

                    <div className="px-8 pb-6 space-y-4">


                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => update('name', e.target.value)}
                                placeholder="Alice Johnson"
                                autoComplete="name"
                                className="input-base"
                            />
                        </div>


                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => update('email', e.target.value)}
                                placeholder="you@example.com"
                                autoComplete="email"
                                className="input-base"
                            />
                        </div>


                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={e => update('password', e.target.value)}
                                    placeholder="Min. 8 characters"
                                    autoComplete="new-password"
                                    className="input-base pr-10"
                                />
                                <button type="button" onClick={() => setShowPassword(s => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>


                            {form.password && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-500">Password strength</span>
                                        <span className="text-xs font-medium" style={{ color: strength.color }}>{strength.label}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div className="h-1.5 rounded-full transition-all duration-300"
                                            style={{ width: strength.width, background: strength.color }} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-1 mt-2">
                                        {passwordRules.map(rule => (
                                            <div key={rule.id} className="flex items-center gap-1.5">
                                                {rule.test(form.password)
                                                    ? <Check size={11} className="text-green-500 shrink-0" />
                                                    : <X size={11} className="text-gray-300 shrink-0" />
                                                }
                                                <span className={`text-[10px] ${rule.test(form.password) ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {rule.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>


                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={form.confirmPassword}
                                    onChange={e => update('confirmPassword', e.target.value)}
                                    placeholder="Repeat your password"
                                    autoComplete="new-password"
                                    onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
                                    className={`input-base pr-10 ${touched.confirmPassword && form.confirmPassword
                                        ? form.password === form.confirmPassword
                                            ? 'border-green-400 focus:border-green-400'
                                            : 'border-red-400 focus:border-red-400'
                                        : ''
                                        }`}
                                />
                                <button type="button" onClick={() => setShowConfirm(s => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {touched.confirmPassword && form.confirmPassword && form.password !== form.confirmPassword && (
                                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                            )}
                        </div>


                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="btn-primary w-full py-3 mt-2"
                        >
                            {isLoading
                                ? <><Loader2 size={16} className="animate-spin" /> Creating account...</>
                                : 'Create Account'
                            }
                        </button>

                        <p className="text-xs text-gray-400 text-center">
                            By signing up, you agree to our{' '}
                            <span className="text-indigo-600 cursor-pointer hover:underline">Terms of Service</span>
                            {' '}and{' '}
                            <span className="text-indigo-600 cursor-pointer hover:underline">Privacy Policy</span>
                        </p>
                    </div>


                    <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href="/login" className="text-indigo-600 font-semibold hover:text-indigo-700">
                                Sign in
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