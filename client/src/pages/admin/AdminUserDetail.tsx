import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUser, updateUser } from '../../api/admin';
import type { User } from '../../api/admin';
import { ArrowLeft, Save, User as UserIcon } from 'lucide-react';
import Spinner from '../../components/Spinner';

export default function AdminUserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<'student' | 'admin'>('student');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (id) loadUser(parseInt(id));
    }, [id]);

    const loadUser = async (userId: number) => {
        try {
            const data = await getUser(userId);
            setUser(data);
            setRole(data.role);
        } catch (err) {
            console.error('Failed to load user', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const updated = await updateUser(user.id, { role });
            setUser(updated);
            alert('User updated successfully');
        } catch (err) {
            alert('Failed to update user');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
    if (!user) return <div className="min-h-screen bg-black flex items-center justify-center text-white">User not found</div>;

    return (
        <div className="min-h-screen bg-black text-slate-200 font-sans p-6 md:p-12">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Users
                </button>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-xl">
                    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-800">
                        <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                            <UserIcon size={40} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">User Details</h1>
                            <p className="text-slate-400 font-mono">ID: #{user.id}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <div className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">Total Topics Started</div>
                                <div className="text-2xl font-bold text-white">{user.stats?.topicsStarted ?? 0}</div>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <div className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">Topics Completed</div>
                                <div className="text-2xl font-bold text-green-400">{user.stats?.topicsCompleted ?? 0}</div>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <div className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">Global Avg Score</div>
                                <div className="text-2xl font-bold text-yellow-500">{user.stats?.globalAverageScore ?? 0}%</div>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <div className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">Achievements</div>
                                <div className="text-2xl font-bold text-purple-400">{user.stats?.totalAchievements ?? 0}</div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                            <div className="text-xl text-white font-medium">{user.email}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Account Created</label>
                                <div className="text-white">{new Date(user.createdAt).toLocaleDateString()}</div>
                                <div className="text-xs text-slate-500 mt-1">({user.stats?.subscriptionDays ?? 0} days ago)</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Last Active</label>
                                <div className="text-white">{user.stats?.lastActive ? new Date(user.stats.lastActive).toLocaleString() : 'Never'}</div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-800">
                            <label className="block text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Role Configuration</label>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setRole('student')}
                                    className={`flex-1 py-3 rounded-lg border-2 transition-all font-bold ${role === 'student' ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-700'}`}
                                >
                                    Student
                                </button>
                                <button
                                    onClick={() => setRole('admin')}
                                    className={`flex-1 py-3 rounded-lg border-2 transition-all font-bold ${role === 'admin' ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-700'}`}
                                >
                                    Admin
                                </button>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                            >
                                {saving ? <Spinner /> : <><Save size={20} /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
