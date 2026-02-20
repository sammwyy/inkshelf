
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import { AlertCircle, Lock } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const SignupView: React.FC = () => {
  const { signup, appSettings } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    inviteCode: ''
  });
  const [error, setError] = useState('');

  const signupMode = appSettings?.app_signup_mode ?? 'none';

  if (signupMode === 'none') {
    return (
      <div className="text-center space-y-8 py-4">
        <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-rose-500/10">
          <Lock size={36} />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-display font-black text-white uppercase tracking-tighter">Registration Disabled</h1>
          <p className="text-zinc-500 font-medium">Public registration is currently disabled by the administrator.</p>
        </div>
        <div className="pt-4">
          <Link to="/login">
            <Button variant="secondary" fullWidth>Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupMode === 'invitation' && !formData.inviteCode) {
      setError("Invitation code is required");
      return;
    }

    try {
      await signup(formData);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    }
  };

  return (
    <>
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-black text-white mb-3 uppercase tracking-tighter">
          {t('auth.signupTitle')}
        </h1>
        <p className="text-zinc-500 font-medium">{t('auth.signupSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            label={t('auth.username')}
            placeholder="johndoe"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
          <Input
            label={t('auth.email')}
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label={t('auth.password')}
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          {signupMode === 'invitation' && (
            <Input
              label="Invitation Code"
              placeholder="XXXX-XXXX"
              value={formData.inviteCode}
              onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value })}
              required
            />
          )}
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-xs font-bold text-rose-500 uppercase tracking-widest text-center flex items-center justify-center gap-2">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <Button fullWidth type="submit" size="lg" className="mt-2">
          {t('auth.signupButton')}
        </Button>
      </form>

      <div className="mt-10 text-center">
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="text-pink-500 hover:text-pink-400 transition-colors">
            {t('auth.loginLink')}
          </Link>
        </p>
      </div>
    </>
  );
};

export default SignupView;
