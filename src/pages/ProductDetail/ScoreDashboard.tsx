import { useState } from 'react';
import { ScoreRing } from '@/components/design-system';
import { Card } from '@/components/ui';

interface ScoreItem {
  label: string;
  score: number;
  tooltip: string;
}

interface ScoreDashboardProps {
  mia: number;
  coors: number;
  qrs: number;
  pns: number;
  className?: string;
}

const scoreItems = (mia: number, coors: number, qrs: number, pns: number): ScoreItem[] => [
  {
    label: 'MIA',
    score: mia,
    tooltip: 'Made In America — measures domestic sourcing of API and finished goods',
  },
  {
    label: 'COORS',
    score: coors,
    tooltip: 'Country of Origin Risk Score — evaluates supply chain risk by origin',
  },
  {
    label: 'QRS',
    score: qrs,
    tooltip: 'Quality Rating Score — rates product quality, safety, and evidence',
  },
  {
    label: 'PNS',
    score: pns,
    tooltip: 'Pricing & Need Score — assesses cost-effectiveness and access',
  },
];

const ScoreDashboard = ({ mia, coors, qrs, pns, className = '' }: ScoreDashboardProps) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const items = scoreItems(mia, coors, qrs, pns);

  return (
    <Card className={className}>
      <h2 className="mb-4 text-lg font-semibold text-navy">Score Dashboard</h2>
      <div
        className="grid grid-cols-2 gap-6 sm:grid-cols-4"
        data-testid="score-dashboard"
      >
        {items.map((item) => (
          <div
            key={item.label}
            className="relative flex flex-col items-center"
            onMouseEnter={() => setActiveTooltip(item.label)}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <ScoreRing score={item.score} label={item.label} size={96} />
            {activeTooltip === item.label && (
              <div
                className="absolute -top-2 left-1/2 z-10 w-48 -translate-x-1/2 -translate-y-full rounded-lg bg-navy px-3 py-2 text-xs text-white shadow-lg"
                role="tooltip"
              >
                {item.tooltip}
                <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-navy" />
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ScoreDashboard;
