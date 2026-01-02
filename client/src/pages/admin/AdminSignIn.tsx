import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';
import Input from '../../components/Input';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminSignIn() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState('');

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErr('');
        setSubmitting(true);
        try {
            await login(email, password);
            // Navigation is handled by AuthContext, but we can force it if needed
            // navigate('/admin/dashboard'); 
        } catch (error: any) {
            console.error(error);
            setErr(error?.response?.data?.message || 'Invalid admin credentials');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-black text-white">
            {/* Left panel */}
            <div className="hidden lg:flex flex-col justify-center p-12 relative overflow-hidden bg-slate-900">
                <div className="relative z-10">
                    <h1 className="text-5xl font-bold mb-6 text-red-500">Admin Portal</h1>
                    <p className="text-xl text-slate-400">Secure access for quantum system administrators.</p>
                </div>
                {/* Background decoration */}
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2"></div>
            </div>

            {/* Right panel */}
            <div className="flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-2">Admin Sign In</h2>
                        <p className="text-slate-400">Enter your credentials to continue.</p>
                    </div>

                    {err && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {err}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={onSubmit}>
                        <Input
                            label="Admin Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@quantumverse.com"
                            autoComplete="email"
                            name="email"
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            name="password"
                        />

                        <button
                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex justify-center items-center"
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting ? <Spinner label="Authenticating..." /> : 'Access Control Panel'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-slate-500 text-sm">
                        Need an account? <Link to="/admin/signup" className="text-red-500 hover:text-red-400 hover:underline">Register New Admin</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
