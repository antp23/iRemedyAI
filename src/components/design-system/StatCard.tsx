import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  className?: string;
}

const trendColors = {
  up: 'text-[#27AE60]',
  down: 'text-[#C0392B]',
  neutral: 'text-navy/50',
};

const trendArrows = {
  up: '↑',
  down: '↓',
  neutral: '→',
};

const StatCard = ({
  icon,
  value,
  label,
  trend,
  className = '',
}: StatCardProps) => {
  return (
    <div
      className={`rounded-xl border border-navy/10 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-navy">
          {icon}
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${trendColors[trend.direction]}`}
            aria-label={`Trend: ${trend.direction} ${trend.value}`}
          >
            <span aria-hidden="true">{trendArrows[trend.direction]}</span>
            {trend.value}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-navy">{value}</p>
        <p className="mt-0.5 text-sm text-navy/60">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
