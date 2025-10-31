import React, { useEffect, useState } from 'react';
import Spinner from '../../components/Spinner';
import { listUsers } from '../../api/user';

export default function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await listUsers();
        if (mounted) setUsers(data);
      } catch (e) {
        if (mounted) setErr(e?.response?.data?.message || 'Failed to load users');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <Hero title="Admin Dashboard" subtitle="Manage users and view system info." />

      <section className="card rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Users</h3>
          <div className="text-sm text-slate-400">{users.length} total</div>
        </div>

        {loading ? (
          <div className="py-10 grid place-items-center">
            <Spinner label="Fetching users..." />
          </div>
        ) : err ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">{err}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="py-3 pr-4">ID</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3 pr-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t border-slate-800/60 hover:bg-green-500/5 transition"
                  >
                    <td className="py-3 pr-4">{u.id}</td>
                    <td className="py-3 pr-4">{u.email}</td>
                    <td className="py-3 pr-4"><span className="badge capitalize">{u.role}</span></td>
                    <td className="py-3 pr-4">
                      <time dateTime={u.createdAt}>{new Date(u.createdAt).toLocaleString()}</time>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400">No users yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function Hero({ title, subtitle }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-green-400/20 p-8">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(600px_200px_at_80%_10%,rgba(16,185,129,0.2),transparent)]" />
      <h1 className="relative z-10 text-3xl md:text-4xl font-extrabold">{title}</h1>
      <p className="relative z-10 mt-3 text-slate-300/80">{subtitle}</p>
    </section>
  );
}