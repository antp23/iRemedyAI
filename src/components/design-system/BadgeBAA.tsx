interface BadgeBAAProps {
  eligible: boolean;
  className?: string;
}

const BadgeBAA = ({ eligible, className = '' }: BadgeBAAProps) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        eligible
          ? 'bg-[#27AE60]/10 text-[#27AE60]'
          : 'bg-[#C0392B]/10 text-[#C0392B]'
      } ${className}`}
      role="status"
      aria-label={`BAA ${eligible ? 'Eligible' : 'Not Eligible'}`}
    >
      {eligible ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M11.5 3.5L5.5 10L2.5 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {eligible ? 'BAA Eligible' : 'Not BAA Eligible'}
    </span>
  );
};

export default BadgeBAA;
