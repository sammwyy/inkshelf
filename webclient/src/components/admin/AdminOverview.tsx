import React, { useEffect, useState } from 'react';
import { Users, BookOpen, Layers, FileText, Clock, Component } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminStats } from '../../lib/types/api';
// @ts-ignore
import packageJson from '../../../package.json';

const AdminOverview: React.FC = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [uptime, setUptime] = useState(0);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminService.getStats();
                setStats(data);
                setUptime(data.uptime);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };

        fetchStats();
    }, []);

    useEffect(() => {
        if (!stats) return;
        const interval = setInterval(() => {
            setUptime(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [stats]);

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${days}d ${hours}h ${minutes}m ${secs}s`;
    };

    if (!stats) {
        return <div className="p-8 text-center text-zinc-500">Loading stats...</div>;
    }

    const cards = [
        { label: 'Total Users', value: stats.counts.users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Total Series', value: stats.counts.series, icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Total Volumes', value: stats.counts.volumes, icon: Layers, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Total Chapters', value: stats.counts.chapters, icon: FileText, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-zinc-500 text-sm font-medium">{card.label}</p>
                                <h3 className="text-2xl font-black text-zinc-900 dark:text-white mt-1 tracking-tight">{card.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl ${card.bg} ${card.color} group-hover:scale-105 transition-transform duration-150`}>
                                <card.icon size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                        <Clock size={20} className="text-violet-500" /> Server Status
                    </h2>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
                            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                                <Component size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Server Uptime</p>
                                <p className="text-2xl font-mono text-zinc-900 dark:text-white mt-1">{formatUptime(uptime)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
                                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Start Time</p>
                                <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-2 font-mono">{new Date(stats.startTime).toLocaleString()}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
                                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">System Versions</p>
                                <div className="mt-2 space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500 dark:text-zinc-400">Backend</span>
                                        <span className="text-zinc-900 dark:text-white font-mono">v{stats.version}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500 dark:text-zinc-400">Client</span>
                                        <span className="text-zinc-900 dark:text-white font-mono">v{packageJson.version}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
