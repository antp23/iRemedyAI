import { type SelectHTMLAttributes, forwardRef } from 'react';
import type { SelectOption } from '@/types';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-navy">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`rounded-lg border border-navy/20 bg-white px-4 py-2 text-navy transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Select;
