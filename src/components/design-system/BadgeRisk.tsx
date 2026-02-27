import type { RiskLevel } from '@/types';

interface BadgeRiskProps {
  level: RiskLevel;
  className?: string;
}

const riskStyles: Record<RiskLevel, string> = {
  low: 'bg-green-100 text-green-800',
  moderate: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const riskLabels: Record<RiskLevel, string> = {
  low: 'Low Risk',
  moderate: 'Moderate',
  high: 'High Risk',
  critical: 'Critical',
};

const BadgeRisk = ({ level, className = '' }: BadgeRiskProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${riskStyles[level]} ${className}`}
    >
      {riskLabels[level]}
    </span>
  );
};

export default BadgeRisk;
