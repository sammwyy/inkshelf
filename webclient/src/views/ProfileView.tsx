
import React, { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';
import { UserProfile } from '../lib/types/api';
import { MapPin, Link as LinkIcon, Calendar, Heart, MessageSquare, Star, BookOpen, User as UserIcon, Play } from 'lucide-react';
import { apiClient } from '../lib/clients/apiClient';

const ProfileView: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const { profile: ownProfile, appSettings } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!username) return;
            setIsLoading(true);
            try {
                // If the username doesn't start with @, it's not a valid profile route according to our convention
                if (!username.startsWith('@')) {
                    setError(true);
                    setIsLoading(false);
                    return;
                }

                // If it's our own username, we can use the ownProfile if available
                const cleanUsername = username.replace('@', '');
                if (ownProfile && ownProfile.username === cleanUsername) {
                    setProfile(ownProfile);
                } else {
                    const data = await profileService.getByUsername(username);
                    setProfile(data);
                }
                setError(false);
            } catch (e) {
                console.error('Profile fetch error:', e);
                setError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [username, ownProfile]);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-6 animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center text-zinc-500">
                    <UserIcon size={40} />
                </div>
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Profile Not Found</h1>
                    <p className="text-zinc-500">The user <span className="text-zinc-300 font-mono">{username}</span> doesn't exist or is private.</p>
                </div>
                <Link
                    to="/"
                    className="px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-2xl shadow-lg shadow-pink-500/20 transition-all active:scale-95"
                >
                    Back to Home
                </Link>
            </div>
        );
    }

    const isOwnProfile = ownProfile?.id === profile.id;

    return (
        <div className="animate-in fade-in duration-700">
            {/* Header / Cover Area */}
            <div className="relative h-48 md:h-64 rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-zinc-800/50">
                <div className="absolute inset-0 backdrop-blur-3xl opacity-50" />
            </div>

            {/* Profile Info */}
            <div className="px-6 md:px-12 -mt-16 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end gap-6">
                    <div className="relative">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-zinc-900 border-4 border-zinc-950 overflow-hidden shadow-2xl">
                            {profile.avatar ? (
                                <img src={apiClient.resolve(profile.avatar)} alt={profile.username} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-600 text-white text-5xl font-bold">
                                    {profile.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 pb-2">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white font-display">@{profile.username}</h1>
                                <p className="text-zinc-400 mt-1 max-w-2xl">{profile.bio || 'This user prefers to keep their bio a mystery.'}</p>
                            </div>
                            {isOwnProfile && (
                                <Link
                                    to="/settings"
                                    className="px-6 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold transition-all border border-zinc-800"
                                >
                                    Edit Profile
                                </Link>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-zinc-500 font-medium">
                            {profile.location && (
                                <div className="flex items-center gap-1.5">
                                    <MapPin size={16} />
                                    {profile.location}
                                </div>
                            )}
                            {profile.website && (
                                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-pink-500 transition-colors">
                                    <LinkIcon size={16} />
                                    {profile.website.replace(/^https?:\/\//, '')}
                                </a>
                            )}
                            <div className="flex items-center gap-1.5">
                                <Calendar size={16} />
                                Joined {new Date(profile.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    {[
                        { id: 'favorites', label: 'Favorites', value: profile.favorites?.length || 0, icon: Heart, color: 'text-pink-500', enabled: true },
                        { id: 'comments', label: 'Comments', value: profile.comments?.length || 0, icon: MessageSquare, color: 'text-blue-500', enabled: appSettings?.feature_comments_enabled ?? true },
                        { id: 'ratings', label: 'Ratings', value: profile.ratings?.length || 0, icon: Star, color: 'text-yellow-500', enabled: appSettings?.feature_ratings_enabled ?? true },
                        { id: 'lists', label: 'Lists', value: profile.lists?.length || 0, icon: BookOpen, color: 'text-emerald-500', enabled: appSettings?.feature_public_lists_enabled ?? true },
                    ].filter(s => s.enabled).map((stat, i) => (
                        <div key={i} className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-3xl backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl bg-white/5 ${stat.color}`}>
                                    <stat.icon size={20} />
                                </div>
                                <div className="truncate">
                                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold truncate">{stat.label}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Reading Progress Section */}
                {profile.readingProgress && profile.readingProgress.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <BookOpen className="text-emerald-500" size={24} />
                            Recent Reading
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {profile.readingProgress.slice(0, 6).map((progress) => (
                                <Link
                                    key={progress.id}
                                    to={`/read/${progress.chapterId}`}
                                    className="flex gap-4 p-4 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 hover:border-emerald-500/30 transition-all group"
                                >
                                    <div className="relative w-20 h-28 shrink-0 rounded-2xl overflow-hidden ring-1 ring-white/10">
                                        <img
                                            src={apiClient.resolve(progress.chapter?.series?.coverImage) || `https://picsum.photos/seed/${progress.id}/200/300`}
                                            alt={progress.chapter?.series?.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Play className="text-white fill-white" size={20} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center min-w-0 flex-1">
                                        <h3 className="font-bold text-sm truncate text-white mb-1 group-hover:text-emerald-400 transition-colors">
                                            {progress.chapter?.series?.title}
                                        </h3>
                                        <p className="text-xs text-emerald-500 font-bold mb-2">
                                            Ch. {progress.chapter?.number} • {Math.round((progress.currentPage / progress.totalPages) * 100)}%
                                        </p>
                                        <div className="mt-auto h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full"
                                                style={{ width: `${(progress.currentPage / progress.totalPages) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Favorites Section */}
                {profile.favorites && profile.favorites.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <Heart className="text-pink-500" fill="currentColor" size={24} />
                            Favorites
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pb-12">
                            {profile.favorites.map((fav) => (
                                fav.series && (
                                    <Link key={fav.id} to={`/series/${fav.series.slug}`} className="group block">
                                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-zinc-900 transition-all duration-300 group-hover:ring-2 group-hover:ring-pink-500/50">
                                            <img
                                                src={apiClient.resolve(fav.series.coverImage) || `https://picsum.photos/seed/${fav.series.id}/300/400`}
                                                alt={fav.series.title}
                                                className="w-full h-full object-cover transition-scale duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-pink-400 transition-colors">{fav.series.title}</h3>
                                    </Link>
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileView;
