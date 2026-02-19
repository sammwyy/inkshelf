
import React from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth,
  loading,
  className = '',
  ...props
}) => {
  const isDark = useSettingsStore(state => state.theme === 'dark');

  const variants = {
    primary: 'bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:opacity-90',
    secondary: isDark
      ? 'bg-zinc-800 text-pink-300 hover:bg-zinc-700'
      : 'bg-pink-50 text-pink-600 hover:bg-pink-100',
    outline: 'border border-pink-500/50 text-pink-500 hover:bg-pink-500/10',
    ghost: isDark
      ? 'text-zinc-500 hover:text-pink-400 hover:bg-zinc-900'
      : 'text-zinc-400 hover:text-pink-600 hover:bg-pink-50',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-lg',
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-black uppercase tracking-widest transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={18} />}
      {children}
    </button>
  );
};

export default Button;
