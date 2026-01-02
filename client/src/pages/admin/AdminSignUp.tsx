import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';
import Input from '../../components/Input';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { ShieldCheck, UserPlus } from 'lucide-react';

export default function AdminSignUp() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState('');

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErr('');

        if (password.length < 8) {
            setErr('Password must be at least 8 characters.');
            return;
        }
        if (password !== confirm) {
            setErr('Passwords do not match.');
            return;
        }

        setSubmitting(true);
        try {
            // Manual call to admin register
            await api.post('/auth/admin/register', { email, password });

            // Auto-login after registration
            await login(email, password);
            // navigate('/admin/dashboard'); // login handles nav usually, but context might check role
        } catch (error: any) {
            setErr(error?.response?.data?.message || 'Failed to create admin account');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-black text-white">
            {/* Left panel */}
            <div className="hidden lg:flex flex-col justify-center p-12 relative overflow-hidden bg-slate-950">
                <div className="relative z-10 max-w-lg">
                    <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                        <ShieldCheck size={32} className="text-white" />
                    </div>
                    <h1 className="text-5xl font-bold mb-6 text-white tracking-tight">System Initialization.</h1>
                    <p className="text-xl text-slate-400 leading-relaxed">
                        Create a new administrative root access point. Responsibilities include user management, system oversight, and content moderation.
                    </p>
                </div>
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-900/5 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2"></div>
            </div>

            {/* Right panel */}
            <div className="flex items-center justify-center p-8 bg-black">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                            <UserPlus className="text-red-500" />
                            New Admin Profile
                        </h2>
                        <p className="text-slate-500">Secure entry for authorized personnel.</p>
                    </div>

                    {err && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start gap-2">
                            <span className="mt-0.5 block w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                            {err}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={onSubmit}>
                        <div className="space-y-4 bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                            <Input
                                label="Admin Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@quantumverse.com"
                                autoComplete="email"
                                name="email"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    name="password"
                                />
                                <Input
                                    label="Confirm"
                                    type="password"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    name="confirm"
                                />
                            </div>
                        </div>

                        <button
                            className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-red-900/20 flex justify-center items-center group"
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting ? <Spinner label="Provisioning..." /> : 'Initialize Admin Protocol'}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-900 text-center space-y-2">
                        <p className="text-slate-500 text-sm">
                            Already have credentials? <Link to="/admin/signin" className="text-white hover:text-red-400 font-medium transition-colors">Sign In here</Link>
                        </p>
                        <p className="text-xs text-slate-600">
                            Unauthorized access is prohibited.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
