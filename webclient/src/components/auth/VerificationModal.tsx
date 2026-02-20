
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Mail, CheckCircle, AlertCircle, Loader2, X, LogOut } from 'lucide-react';

const VerificationModal: React.FC = () => {
    const { user, requestVerification, confirmVerification, logout } = useAuth();
    const { t } = useTranslation();
    const [code, setCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    if (!user || user.emailVerified) return null;

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code) return;

        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        try {
            await confirmVerification(code);
            setSuccess('Email verified successfully!');
        } catch (err: any) {
            setError(err.message || 'Invalid verification code.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        setError(null);
        setSuccess(null);
        setIsResending(true);

        try {
            await requestVerification();
            setSuccess('Verification code resent to your email.');
        } catch (err: any) {
            setError(err.message || 'Failed to resend code.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-all duration-700" />

            {/* Modal */}
            <div className="relative w-full max-w-md glass rounded-[3rem] p-10 md:p-14 shadow-[0_50px_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500 overflow-hidden border border-white/5 group">
                {/* Inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                <button
                    onClick={logout}
                    className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-all p-3 hover:bg-white/5 rounded-2xl group"
                >
                    <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="relative z-10 text-center space-y-10">
                    <div className="w-20 h-20 rounded-[2rem] bg-pink-500 text-white flex items-center justify-center mx-auto shadow-2xl shadow-pink-500/20 rotate-3 transition-transform hover:rotate-0 duration-500">
                        <Mail size={36} />
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-3xl font-black text-white font-display uppercase tracking-tighter">Verify your email</h2>
                        <p className="text-zinc-500 font-medium">
                            We've sent a 6-digit code to <br />
                            <span className="text-white font-bold">{user.email}</span>
                        </p>
                    </div>

                    <form onSubmit={handleConfirm} className="space-y-8">
                        <Input
                            label="Verification Code"
                            placeholder="0 0 0 0 0 0"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            className="text-center text-3xl tracking-[0.6em] font-display font-black py-5 h-20"
                            maxLength={6}
                        />

                        {error && (
                            <div className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest animate-in shake duration-300">
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest animate-in fade-in duration-300">
                                <CheckCircle size={14} />
                                {success}
                            </div>
                        )}

                        <Button
                            fullWidth
                            type="submit"
                            size="lg"
                            className="h-16 rounded-[2rem] shadow-2xl shadow-pink-500/20"
                            disabled={!code || isSubmitting}
                            loading={isSubmitting}
                        >
                            Confirm Identity
                        </Button>
                    </form>

                    <div className="pt-4 space-y-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                            Didn't receive it?{' '}
                            <button
                                onClick={handleResend}
                                disabled={isResending}
                                className="text-pink-500 hover:text-pink-400 font-black transition-colors disabled:opacity-50 underline decoration-2 underline-offset-4"
                            >
                                {isResending ? 'Resending...' : 'Resend Code'}
                            </button>
                        </p>

                        <button
                            onClick={logout}
                            className="text-[10px] text-zinc-600 hover:text-white font-black uppercase tracking-[0.3em] transition-colors py-2"
                        >
                            Use a different account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationModal;
