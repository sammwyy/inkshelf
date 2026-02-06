
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
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-all">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Cloud size={120} className="text-pink-500" />
        </div>
        
        <div className="relative z-10 text-center space-y-6">
          <div className="flex justify-end mb-2">
            <button 
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-zinc-500 hover:text-pink-400 transition-colors"
            >
              <Languages size={14} />
              {language === 'en' ? 'ES' : 'EN'}
            </button>
          </div>

          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto transition-all duration-500 ${success ? 'bg-green-500/10 text-green-500' : 'bg-pink-500/10 text-pink-500'}`}>
            {success ? <CheckCircle2 size={32} /> : <Cloud size={32} />}
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-white mb-2 font-display">{t('setup.title')}</h1>
            <p className="text-gray-400 text-sm">{t('setup.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <Input 
              label={t('setup.inputLabel')}
              placeholder={t('setup.inputPlaceholder')}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isVerifying || success}
              required
            />
            
            {error && (
              <div className="flex items-start gap-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs leading-relaxed animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold uppercase tracking-wider text-[10px]">{t('setup.errorTitle')}</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <Button 
              fullWidth 
              type="submit" 
              size="lg" 
              disabled={isVerifying || success}
              className={success ? 'bg-green-600' : ''}
            >
              {isVerifying ? t('setup.buttonVerifying') : success ? t('setup.buttonConnected') : t('setup.buttonConnect')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetupView;
