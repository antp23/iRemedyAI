import type { RiskLevel } from '@/types';

interface BadgeRiskProps {
  level: RiskLevel;
  className?: string;
}

const riskConfig: Record<RiskLevel, { label: string; colors: string }> = {
  low: {
    label: 'Low',
    colors: 'bg-[#27AE60]/10 text-[#27AE60]',
  },
  moderate: {
    label: 'Medium',
    colors: 'bg-[#F1C40F]/10 text-[#D4AC0D]',
  },
  high: {
    label: 'High',
    colors: 'bg-[#E67E22]/10 text-[#E67E22]',
  },
  critical: {
    label: 'Critical',
    colors: 'bg-[#C0392B]/10 text-[#C0392B]',
  },
};

const BadgeRisk = ({ level, className = '' }: BadgeRiskProps) => {
  const config = riskConfig[level];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${config.colors} ${className}`}
      role="status"
      aria-label={`Risk level: ${config.label}`}
    >
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          level === 'low'
            ? 'bg-[#27AE60]'
            : level === 'moderate'
              ? 'bg-[#D4AC0D]'
              : level === 'high'
                ? 'bg-[#E67E22]'
                : 'bg-[#C0392B]'
        }`}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
};

export default BadgeRisk;
