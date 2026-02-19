import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Edit, Ban, CheckCircle, XCircle, Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';
import { usersService } from '../../services/usersService';
import { User, Role } from '../../lib/types/api';

const UsersManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [revealedEmails, setRevealedEmails] = useState<Record<string, boolean>>({});
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState({
        username: '',
        email: '',
        role: Role.USER,
        password: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');


    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setEditForm({
            username: user.profile?.username || '',
            email: user.email,
            role: user.role,
            password: '',
        });
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setIsSaving(true);
        try {
            const updates: any = {};
            if (editForm.username !== editingUser.profile?.username) updates.username = editForm.username;
            if (editForm.email !== editingUser.email) updates.email = editForm.email;
            if (editForm.role !== editingUser.role) updates.role = editForm.role;
            if (editForm.password) updates.password = editForm.password;

            if (Object.keys(updates).length > 0) {
                await usersService.update(editingUser.id, updates);
                await fetchUsers(); // This assumes fetchUsers is in scope, which it is
            }
            setEditingUser(null);
        } catch (error) {
            alert('Failed to update user');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const result = await usersService.list({
                page: pagination.page,
                limit: pagination.limit,
                search: searchTerm,
            });
            if (result && Array.isArray(result.data)) {
                setUsers(result.data);
                if (result.pagination) {
                    setPagination(prev => ({ ...prev, ...result.pagination }));
                }
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, pagination.page]);

    const toggleEmail = (id: string) => {
        setRevealedEmails(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-150 relative">
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Edit User</h3>
                            <button onClick={() => setEditingUser(null)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveUser} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Username</label>
                                <input
                                    type="text"
                                    value={editForm.username}
                                    onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-pink-500 transition-all text-sm text-zinc-900 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Email</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-pink-500 transition-all text-sm text-zinc-900 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Role</label>
                                <select
                                    value={editForm.role}
                                    onChange={e => setEditForm({ ...editForm, role: e.target.value as Role })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-pink-500 transition-all text-sm text-zinc-900 dark:text-white"
                                >
                                    <option value={Role.USER}>User</option>
                                    <option value={Role.ADMIN}>Admin</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Password (Leave blank to keep)</label>
                                <input
                                    type="password"
                                    value={editForm.password}
                                    onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                                    placeholder="New Password"
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-pink-500 transition-all text-sm text-zinc-900 dark:text-white"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-pink-500 text-white font-semibold text-sm hover:bg-pink-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <div className="flex items-center justify-between gap-4 bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-pink-500 transition-colors"
                    />
                </div>
                <button className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors font-bold text-sm">
                    <UserPlus size={18} /> New User
                </button>
            </div>

            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80">
                                <th className="text-left py-4 px-6 text-xs font-bold text-zinc-500 uppercase tracking-wider">User</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-zinc-500 uppercase tracking-wider">Role</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-zinc-500 uppercase tracking-wider">Joined</th>
                                <th className="text-right py-4 px-6 text-xs font-bold text-zinc-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {users.map(user => (
                                <tr key={user.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                                                {user.profile?.avatar ? (
                                                    <img src={user.profile.avatar} alt={user.profile.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-zinc-400 dark:text-zinc-500 font-bold text-lg">{user.profile?.username?.[0]?.toUpperCase() || 'U'}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-zinc-900 dark:text-white font-medium">{user.profile?.username || 'Unknown'}</p>
                                                <div className="flex items-center gap-1.5 cursor-pointer text-zinc-400 dark:text-zinc-500 text-xs hover:text-pink-500 transition-colors" onClick={() => toggleEmail(user.id)}>
                                                    {revealedEmails[user.id] ? user.email : '••••••••••••'}
                                                    {revealedEmails[user.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${user.role === Role.ADMIN
                                            ? 'bg-violet-500/10 text-violet-500 border-violet-500/20'
                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        {user.bannedAt ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                                                <Ban size={12} /> Banned
                                            </span>
                                        ) : user.isActive ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                <CheckCircle size={12} /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-100 dark:bg-zinc-500/10 text-zinc-500 border border-zinc-200 dark:border-zinc-500/20">
                                                <XCircle size={12} /> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-zinc-500 dark:text-zinc-400 text-sm">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                            <button
                                                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                                title="Edit"
                                                onClick={() => handleEditClick(user)}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            {user.bannedAt ? (
                                                <button className="p-2 hover:bg-emerald-500/20 rounded-lg text-emerald-500 transition-colors" title="Unban">
                                                    <CheckCircle size={16} />
                                                </button>
                                            ) : (
                                                <button className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors" title="Ban">
                                                    <Ban size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30">
                    <p className="text-zinc-500 text-sm">
                        Showing {users.length} of {pagination.total} users
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={pagination.page <= 1}
                            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                            className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 disabled:opacity-50 text-zinc-700 dark:text-white rounded-lg text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                            className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 disabled:opacity-50 text-zinc-700 dark:text-white rounded-lg text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsersManagement;
