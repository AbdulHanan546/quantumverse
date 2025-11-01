import React, { useState} from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';
import Input from '../../components/Input';
import { Link } from 'react-router-dom';

export default function SignIn() {
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
      await login(email.trim(), password);
      // navigation handled by context
    } catch (error: any) {
      setErr(error?.response?.data?.message || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return (
   <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-black via-gray-900 to-gray-800">
  {/* Left panel */}
  <div className="hidden lg:block relative">
    <div className="absolute inset-0 z-0">
      <GridArt />
    </div>
    <div className="relative z-10 h-full p-10 flex flex-col justify-end">
      <h1 className="text-5xl font-black leading-tight text-white">
        Welcome to <span className="text-green-400 neon">Quantumverse</span>
      </h1>
      <p className="mt-4 text-slate-300/80 max-w-xl">
        Secure, fast, and modern authentication for students and admins. Sign in to continue.
      </p>
    </div>
  </div>

      {/* Right panel with form */}
       <div className="flex items-center justify-center p-6">
    <div className="w-full max-w-md card rounded-2xl p-8 bg-gray-800/80 backdrop-blur-md shadow-lg">
      <h2 className="text-2xl font-bold mb-1 text-white">Sign in</h2>
      <p className="text-slate-400 mb-6">Use your email and password</p>


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
              autoComplete="current-password"
              name="password"
            />
            <button
              className="btn-primary w-full flex justify-center items-center gap-2"
              type="submit"
              disabled={submitting}
            >
              {submitting ? <Spinner label="Signing in..." /> : 'Sign in'}
            </button>
          </form>

          <div className="divider" />
          <div className="text-sm text-slate-400 text-center">
            Don’t have an account?{' '}
            <Link
              to="/signup"
              className="text-green-400 hover:text-green-300 underline underline-offset-4"
            >
              Sign up
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
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.15),transparent_40%)]" />
      <svg className="absolute inset-0 w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div className="absolute -bottom-10 left-10 w-40 h-40 bg-green-500/20 rounded-full blur-3xl" />
      <div className="absolute top-20 right-10 w-28 h-28 bg-emerald-400/20 rounded-full blur-3xl" />
    </div>
  );
}

