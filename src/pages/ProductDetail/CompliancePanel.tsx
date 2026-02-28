import { ComplianceGrid } from '@/components/shared';
import type { ComplianceStatusGrid } from '@/components/shared';
import { Card } from '@/components/ui';

interface CompliancePanelProps {
  status: ComplianceStatusGrid;
  notes: string[];
  className?: string;
}

const CompliancePanel = ({ status, notes, className = '' }: CompliancePanelProps) => {
  return (
    <Card className={className} data-testid="compliance-panel">
      <h2 className="mb-4 text-lg font-semibold text-navy">Compliance</h2>
      <ComplianceGrid status={status} />
      {notes.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-medium text-navy/70">Compliance Notes</h3>
          <ul className="space-y-1.5">
            {notes.map((note, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-navy/60"
              >
                <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold" />
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default CompliancePanel;
