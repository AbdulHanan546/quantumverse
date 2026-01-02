import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, deleteUser } from '../../api/admin';
import type { User } from '../../api/admin';
import { Trash2, Eye, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            console.error('Failed to load users', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
        try {
            await deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    return (
        <div className="min-h-screen bg-black text-slate-200 font-sans">
            {/* Navbar */}
            <nav className="border-b border-red-900/30 bg-red-950/10 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-bold text-white">Q</div>
                        <span className="font-bold text-lg text-white">QuantumVerse <span className="text-red-500 px-2 py-0.5 rounded bg-red-950 border border-red-900/50 text-xs uppercase tracking-wider">Admin</span></span>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-white">User Management</h1>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-400">
                        Total Users: <span className="text-white font-bold ml-2">{users.length}</span>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-500">Loading users...</div>
                ) : (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/80">
                                    <th className="p-4 text-xs uppercase tracking-wider text-slate-500 font-bold">ID</th>
                                    <th className="p-4 text-xs uppercase tracking-wider text-slate-500 font-bold">User</th>
                                    <th className="p-4 text-xs uppercase tracking-wider text-slate-500 font-bold">Role</th>
                                    <th className="p-4 text-xs uppercase tracking-wider text-slate-500 font-bold">Joined</th>
                                    <th className="p-4 text-xs uppercase tracking-wider text-slate-500 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4 text-slate-500 font-mono text-sm">#{user.id}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                                    <UserIcon size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${user.role === 'admin' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}
                      `}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-400 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/users/${user.id}`)}
                                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {users.length === 0 && (
                            <div className="p-12 text-center text-slate-500">No users found.</div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
