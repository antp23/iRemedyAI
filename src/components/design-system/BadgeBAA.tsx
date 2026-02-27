interface BadgeBAAProps {
  compliant: boolean;
  className?: string;
}

const BadgeBAA = ({ compliant, className = '' }: BadgeBAAProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
        compliant
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      } ${className}`}
    >
      BAA {compliant ? 'Pass' : 'Fail'}
    </span>
  );
};

export default BadgeBAA;
