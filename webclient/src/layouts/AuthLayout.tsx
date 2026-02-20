import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen w-full bg-[#050505] text-[#f4f4f5] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Ambient Background - Premium feel */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[10s]" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[8s] delay-1000" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none" />

            {/* Auth Container */}
            <div className="w-full max-w-[440px] relative z-10 animate-in fade-in zoom-in-95 duration-700">
                {/* Header */}
                <div className="flex items-center justify-between px-2 mb-8">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-11 h-11 bg-pink-500 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-pink-500/40 group-hover:scale-105 group-hover:rotate-3 transition-all duration-500 font-display">
                            <span className="font-black text-2xl">I</span>
                        </div>
                        <span className="font-display font-black text-2xl tracking-tighter uppercase">INK<span className="text-pink-500">SHELF</span></span>
                    </Link>

                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] group py-2"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back</span>
                    </button>
                </div>

                {/* Main Auth Card */}
                <div className="glass rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-black/40 relative overflow-hidden group border border-white/5">
                    {/* Inner glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                    <div className="relative z-10">
                        {children}
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em] opacity-30">
                        Inkshelf Reading System
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
