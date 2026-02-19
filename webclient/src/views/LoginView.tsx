
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
    <div className="max-w-md mx-auto mt-20 p-8 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-xl">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">{t('auth.loginTitle')}</h1>
        <p className="text-gray-400">{t('auth.loginSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('auth.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label={t('auth.password')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <Button fullWidth type="submit" size="lg" className="mt-4">{t('auth.loginButton')}</Button>
      </form>

      {signupMode !== 'none' && (
        <div className="mt-8 text-center text-sm text-gray-400">
          {t('auth.noAccount')} <Link to="/signup" className="text-pink-400 hover:text-pink-300 font-medium">{t('auth.createAccount')}</Link>
        </div>
      )}
    </div>
  );
};

export default LoginView;
