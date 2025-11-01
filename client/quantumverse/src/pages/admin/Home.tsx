import React, { useEffect, useState } from 'react';
import { listUsers } from '../../api/user';
import type { User } from '../../api/user';
import Spinner from '../../components/Spinner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await listUsers();
        if (mounted) setUsers(data);
      } catch (e: any) {
        if (mounted) setErr(e?.response?.data?.message || 'Failed to load users');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 space-y-10">
      <Hero title="Admin Dashboard" subtitle="Manage users and view system info." />

      <section className="relative bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-green-400">Users</h3>
          <div className="text-sm text-slate-400">{users.length} total</div>
        </div>

        <AnimatePresence>
          {loading ? (
            <motion.div
              className="py-16 grid place-items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Spinner label="Fetching users..." />
            </motion.div>
          ) : err ? (
            <motion.div
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {err}
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-gray-800/50">
                  <tr className="text-slate-400 uppercase text-sm">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((u) => (
                      <motion.tr
                        key={u.id}
                        className="border-t border-slate-800/60 hover:bg-green-500/5 transition-all"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        layout
                      >
                        <td className="py-3 px-4 font-mono text-slate-300">{u.id}</td>
                        <td className="py-3 px-4">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className="inline-block bg-green-600/20 text-green-300 px-3 py-1 rounded-full text-sm capitalize">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-sm">
{u.createdAt && (
  <time dateTime={u.createdAt}>
    {new Date(u.createdAt).toLocaleString()}
  </time>
)}
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No users yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}

interface HeroProps {
  title: string;
  subtitle: string;
}

function Hero({ title, subtitle }: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-green-400/20 p-8 mb-4">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(600px_200px_at_80%_10%,rgba(16,185,129,0.2),transparent)]" />
      <h1 className="relative z-10 text-3xl md:text-4xl font-extrabold text-green-400">{title}</h1>
      <p className="relative z-10 mt-3 text-slate-300/80">{subtitle}</p>
    </section>
  );
}
