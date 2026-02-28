import type { RiskLevel } from '@/types';
import { BadgeRisk } from '@/components/design-system';

export interface ComplianceStatusGrid {
  baaCompliant: boolean;
  taaCompliant: boolean;
  fdaApproved: boolean;
  riskLevel: RiskLevel;
}

interface ComplianceGridProps {
  status: ComplianceStatusGrid;
  className?: string;
}

const PassFailBadge = ({
  label,
  passed,
}: {
  label: string;
  passed: boolean;
}) => (
  <div className="flex flex-col items-center gap-1 rounded-lg border border-navy/10 bg-white p-3">
    <span className="text-xs font-medium text-navy/60">{label}</span>
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {passed ? 'Pass' : 'Fail'}
    </span>
  </div>
);

const ComplianceGrid = ({ status, className = '' }: ComplianceGridProps) => {
  return (
    <div
      className={`grid grid-cols-2 gap-3 sm:grid-cols-4 ${className}`}
      data-testid="compliance-grid"
    >
      <PassFailBadge label="BAA" passed={status.baaCompliant} />
      <PassFailBadge label="TAA" passed={status.taaCompliant} />
      <PassFailBadge label="FDA" passed={status.fdaApproved} />
      <div className="flex flex-col items-center gap-1 rounded-lg border border-navy/10 bg-white p-3">
        <span className="text-xs font-medium text-navy/60">Risk Level</span>
        <BadgeRisk level={status.riskLevel} />
      </div>
    </div>
  );
};

export default ComplianceGrid;
