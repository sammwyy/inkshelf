
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const LoginView: React.FC = () => {
  const { login, appSettings } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const signupMode = appSettings?.app_signup_mode ?? 'none';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <>
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-black text-white mb-3 uppercase tracking-tighter">
          {t('auth.loginTitle')}
        </h1>
        <p className="text-zinc-500 font-medium">{t('auth.loginSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            label={t('auth.email')}
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label={t('auth.password')}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-xs font-bold text-rose-500 uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        <Button fullWidth type="submit" size="lg" className="mt-2">
          {t('auth.loginButton')}
        </Button>
      </form>

      {signupMode !== 'none' && (
        <div className="mt-10 text-center">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
            {t('auth.noAccount')}{' '}
            <Link to="/signup" className="text-pink-500 hover:text-pink-400 transition-colors">
              {t('auth.createAccount')}
            </Link>
          </p>
        </div>
      )}
    </>
  );
};

export default LoginView;
