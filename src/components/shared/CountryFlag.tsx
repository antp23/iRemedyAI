interface CountryFlagProps {
  countryCode: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses: Record<string, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
};

const toFlagEmoji = (code: string): string => {
  const upper = code.toUpperCase();
  if (upper.length !== 2) return '';
  const offset = 0x1f1e6 - 65; // Regional Indicator Symbol Letter A offset
  return String.fromCodePoint(
    upper.charCodeAt(0) + offset,
    upper.charCodeAt(1) + offset
  );
};

const CountryFlag = ({
  countryCode,
  size = 'md',
  className = '',
}: CountryFlagProps) => {
  const flag = toFlagEmoji(countryCode);

  return (
    <span
      className={`inline-block leading-none ${sizeClasses[size]} ${className}`}
      role="img"
      aria-label={`Flag of ${countryCode}`}
      data-testid={`country-flag-${countryCode}`}
    >
      {flag}
    </span>
  );
};

export default CountryFlag;
