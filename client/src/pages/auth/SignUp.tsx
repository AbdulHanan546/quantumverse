import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';
import Input from '../../components/Input';
import { Link } from 'react-router-dom';

export default function SignUp() {
  const { register } = useAuth();
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
      await register(email.trim(), password);
      // navigation handled by context
    } catch (error: any) {
      setErr(error?.response?.data?.message || 'Failed to sign up');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh grid lg:grid-cols-2">
      {/* Left panel with illustration */}
      <div className="hidden lg:block relative">
        <div className="absolute inset-0">
          <GridArt />
        </div>
        <div className="relative z-10 h-full p-10 flex flex-col justify-end">
          <h1 className="text-5xl font-black leading-tight">
            Create your <span className="text-green-400 neon">student account</span>
          </h1>
          <p className="mt-4 text-slate-300/80 max-w-xl">
            Sign up to get started. Admin accounts are created by the system owner.
          </p>
        </div>
      </div>

      {/* Right panel with form */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md card rounded-2xl p-8 bg-gray-900/50 backdrop-blur-md shadow-lg">
          <h2 className="text-2xl font-bold mb-1">Sign up</h2>
          <p className="text-slate-400 mb-6">It’s fast and secure</p>

          {err && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
              {err}
            </div>
          )}

          <form className="space-y-5" onSubmit={onSubmit}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              name="email"
            />
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
              label="Confirm Password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              name="confirm"
            />
            <button
              className="btn-primary w-full flex justify-center items-center gap-2"
              type="submit"
              disabled={submitting}
            >
              {submitting ? <Spinner label="Creating account..." /> : 'Create account'}
            </button>
          </form>

          <div className="divider" />
          <div className="text-sm text-slate-400 text-center">
            Already have an account?{' '}
            <Link
              to="/"
              className="text-green-400 hover:text-green-300 underline underline-offset-4"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// GridArt component for left-side visual
function GridArt() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.15),transparent_40%)]" />
      <svg className="absolute inset-0 w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid2" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid2)" />
      </svg>
      <div className="absolute -bottom-16 right-10 w-40 h-40 bg-green-500/20 rounded-full blur-3xl" />
      <div className="absolute top-10 left-16 w-28 h-28 bg-emerald-400/20 rounded-full blur-3xl" />
    </div>
  );
}
