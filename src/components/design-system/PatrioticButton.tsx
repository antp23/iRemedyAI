import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface PatrioticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
};

const PatrioticButton = ({
  children,
  loading = false,
  size = 'md',
  className = '',
  disabled,
  ...props
}: PatrioticButtonProps) => {
  return (
    <button
      className={`relative inline-flex items-center justify-center gap-2 rounded-lg font-semibold text-offWhite shadow-md transition-all duration-200 hover:shadow-lg hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100 ${sizeStyles[size]} ${className}`}
      style={{
        background: 'linear-gradient(135deg, #0A1628 0%, #1a2a4a 40%, #C9A227 100%)',
      }}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeOpacity={0.3}
          />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default PatrioticButton;
