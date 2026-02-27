import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-navy">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`rounded-lg border border-navy/20 bg-white px-4 py-2 text-navy transition-colors placeholder:text-navy/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
