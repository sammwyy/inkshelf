
import React from 'react';
import { useSettingsStore } from '../../stores/settingsStore';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  const isDark = useSettingsStore(state => state.theme === 'dark');

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-2 font-display ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
          {label}
        </label>
      )}
      <input
        className={`
          border-2 rounded-[1.25rem] px-5 py-4 text-sm outline-none transition-all duration-300
          placeholder:text-zinc-600 font-medium
          ${isDark
            ? 'bg-zinc-800/20 border-zinc-800 text-gray-100 focus:border-pink-500/50 focus:bg-zinc-800/40'
            : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-pink-500/30 focus:bg-white'
          }
          ${error ? 'border-rose-500/50 bg-rose-500/5' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-[10px] font-black text-rose-500 ml-2 uppercase tracking-widest">{error}</span>}
    </div>
  );
};

export default Input;
