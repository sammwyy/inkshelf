
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../lib/clients/apiClient';
import { useTranslation } from '../hooks/useTranslation';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Cloud, AlertCircle, CheckCircle2, Languages } from 'lucide-react';

const SetupView: React.FC = () => {
  const { configureApi } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const [url, setUrl] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setError(null);
    setSuccess(false);
    setIsVerifying(true);

    const result = await apiClient.checkHealth(url);

    if (result.ok) {
      setSuccess(true);
      const normalized = apiClient.normalizeUrl(url);
      setTimeout(() => {
        configureApi(normalized);
      }, 1000);
    } else {
      setError(result.error || t('setup.errorDefault'));
      setIsVerifying(false);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-pink-500 transition-colors py-2 px-3 rounded-xl hover:bg-white/5"
        >
          <Languages size={14} />
          {language === 'en' ? 'Castellano' : 'English'}
        </button>
      </div>

      <div className="text-center space-y-8">
        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto transition-all duration-700 shadow-2xl ${success ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-pink-500 text-white shadow-pink-500/20'}`}>
          {success ? <CheckCircle2 size={36} /> : <Cloud size={36} />}
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-display font-black text-white uppercase tracking-tighter">
            {t('setup.title')}
          </h1>
          <p className="text-zinc-500 font-medium">{t('setup.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <Input
            label={t('setup.inputLabel')}
            placeholder="https://api.inkshelf.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isVerifying || success}
            required
          />

          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-xs font-bold text-rose-500 uppercase tracking-widest text-center flex items-center justify-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <Button
            fullWidth
            type="submit"
            size="lg"
            className="mt-2"
            disabled={isVerifying || success}
            loading={isVerifying}
          >
            {success ? t('setup.buttonConnected') : t('setup.buttonConnect')}
          </Button>
        </form>
      </div>
    </>
  );
};

export default SetupView;
