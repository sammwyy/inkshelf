
import React from 'react';
import { useSettingsStore } from '../../stores/settingsStore';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  const isDark = useSettingsStore(state => state.theme === 'dark');

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{label}</label>}
      <input
        className={`
          border rounded-xl px-4 py-3 text-sm outline-none transition-all
          placeholder:text-zinc-500
          ${isDark
            ? 'bg-zinc-900 border-zinc-800 text-gray-200 focus:border-pink-500'
            : 'bg-white border-zinc-200 text-zinc-900 focus:border-pink-400'
          }
          ${error ? 'border-rose-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-[10px] font-bold text-rose-500 ml-1 uppercase">{error}</span>}
    </div>
  );
};

export default Input;
