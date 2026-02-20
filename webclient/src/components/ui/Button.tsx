
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
    primary: `bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/25 border border-pink-400/20 hover:shadow-pink-500/40 hover:-translate-y-0.5`,
    secondary: isDark
      ? 'bg-zinc-900 text-pink-500 border border-zinc-800 hover:bg-zinc-800'
      : 'bg-zinc-100 text-zinc-900 border border-zinc-200 hover:bg-zinc-200',
    outline: 'border-2 border-pink-500/30 text-pink-500 hover:bg-pink-500/5 hover:border-pink-500/50',
    ghost: isDark
      ? 'text-zinc-500 hover:text-pink-500 hover:bg-pink-500/5'
      : 'text-zinc-400 hover:text-pink-600 hover:bg-pink-50',
  };

  const sizes = {
    sm: 'px-5 py-2.5 text-[10px]',
    md: 'px-7 py-3.5 text-xs',
    lg: 'px-10 py-4.5 text-sm',
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2.5 rounded-[1.25rem] font-display font-black uppercase tracking-[0.2em] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={16} />}
      {!loading && children}
    </button>
  );
};

export default Button;
