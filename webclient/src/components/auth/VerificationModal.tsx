
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                <button
                    onClick={logout}
                    className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors p-2"
                >
                    <LogOut size={20} />
                </button>

                <div className="text-center space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-pink-500/10 flex items-center justify-center mx-auto text-pink-500">
                        <Mail size={32} />
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white font-display">Verify your email</h2>
                        <p className="text-zinc-400 text-sm mt-2">
                            We've sent a verification code to <br />
                            <span className="text-white font-medium">{user.email}</span>
                        </p>
                    </div>

                    <form onSubmit={handleConfirm} className="space-y-4">
                        <Input
                            label="Verification Code"
                            placeholder="Enter 6-digit code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            className="text-center text-2xl tracking-[0.5em] font-mono"
                            maxLength={6}
                        />

                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                                <CheckCircle size={16} />
                                {success}
                            </div>
                        )}

                        <Button
                            fullWidth
                            type="submit"
                            disabled={!code}
                            loading={isSubmitting}
                        >
                            Verify Email
                        </Button>
                    </form>

                    <div className="pt-2">
                        <p className="text-xs text-zinc-500">
                            Didn't receive the code?{' '}
                            <button
                                onClick={handleResend}
                                disabled={isResending}
                                className="text-pink-500 hover:text-pink-400 font-bold disabled:opacity-50"
                            >
                                {isResending ? 'Sending...' : 'Resend Code'}
                            </button>
                        </p>
                    </div>

                    <button
                        onClick={logout}
                        className="text-xs text-zinc-600 hover:text-zinc-400 font-medium underline px-4 py-2"
                    >
                        Use a different account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerificationModal;
