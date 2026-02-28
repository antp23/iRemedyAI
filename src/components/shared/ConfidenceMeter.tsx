interface ConfidenceMeterProps {
  confidence: number;
  label?: string;
  className?: string;
}

const getBarColor = (confidence: number): string => {
  if (confidence >= 80) return 'bg-green-500';
  if (confidence >= 60) return 'bg-yellow-400';
  if (confidence >= 40) return 'bg-orange-400';
  return 'bg-red-500';
};

const getTextColor = (confidence: number): string => {
  if (confidence >= 80) return 'text-green-700';
  if (confidence >= 60) return 'text-yellow-700';
  if (confidence >= 40) return 'text-orange-700';
  return 'text-red-700';
};

const ConfidenceMeter = ({
  confidence,
  label,
  className = '',
}: ConfidenceMeterProps) => {
  const clamped = Math.max(0, Math.min(100, confidence));

  return (
    <div className={`w-full ${className}`} data-testid="confidence-meter">
      <div className="mb-1 flex items-center justify-between">
        {label && (
          <span className="text-xs font-medium text-navy/70">{label}</span>
        )}
        <span className={`text-xs font-bold ${getTextColor(clamped)}`}>
          {clamped}%
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor(clamped)}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

export default ConfidenceMeter;
