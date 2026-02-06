
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
      <div className="max-w-md mx-auto mt-20 p-12 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
          <Lock size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Registration Disabled</h1>
          <p className="text-zinc-500">Public registration is currently disabled by the administrator.</p>
        </div>
        <Link to="/login">
          <Button variant="ghost" className="text-pink-500">Go to Login</Button>
        </Link>
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
    <div className="max-w-md mx-auto mt-20 p-8 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">{t('auth.signupTitle')}</h1>
        <p className="text-gray-400">{t('auth.signupSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('auth.username')}
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />
        <Input
          label={t('auth.email')}
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <Input
          label={t('auth.password')}
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        {signupMode === 'invitation' && (
          <Input
            label="Invitation Code"
            placeholder="XXXX"
            value={formData.inviteCode}
            onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value })}
            required
          />
        )}

        {error && <p className="text-sm text-rose-400 flex items-center gap-2 bg-rose-500/5 p-3 rounded-xl border border-rose-500/20">
          <AlertCircle size={16} />
          {error}
        </p>}
        <Button fullWidth type="submit" size="lg" className="mt-4">{t('auth.signupButton')}</Button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-400">
        {t('auth.hasAccount')} <Link to="/login" className="text-pink-400 hover:text-pink-300 font-medium">{t('auth.loginLink')}</Link>
      </div>
    </div>
  );
};

export default SignupView;
