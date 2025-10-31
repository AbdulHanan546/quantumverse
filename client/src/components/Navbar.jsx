import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/60 backdrop-blur supports-[backdrop-filter]:bg-black/30">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 grid place-items-center rounded-lg bg-green-500/15 border border-green-400/30 shadow-[0_0_24px_rgba(34,197,94,0.35)]">
            <span className="text-green-400 font-bold">Q</span>
          </div>
          <div className="text-lg font-semibold tracking-tight">
            Quantumverse <span className="text-green-400"></span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <span className="hidden sm:inline text-sm text-slate-300/80">{user.email}</span>
              <span className="badge capitalize">{user.role}</span>
            </>
          )}
          <button
            onClick={logout}
            className="btn-ghost hover:border-green-400/40 hover:text-green-300"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}