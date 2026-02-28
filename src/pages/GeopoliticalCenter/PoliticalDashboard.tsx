import { ScoreRing, StatCard } from '@/components/design-system';
import { Card } from '@/components/ui';

export interface ManufacturerPNS {
  id: string;
  name: string;
  pnsScore: number;
  productCount: number;
  primaryCountry: string;
  baaEligible: boolean;
}

interface PoliticalDashboardProps {
  manufacturers: ManufacturerPNS[];
  className?: string;
}

const PoliticalDashboard = ({
  manufacturers,
  className = '',
}: PoliticalDashboardProps) => {
  const avgScore =
    manufacturers.length > 0
      ? Math.round(
          manufacturers.reduce((sum, m) => sum + m.pnsScore, 0) / manufacturers.length,
        )
      : 0;

  const baaCount = manufacturers.filter((m) => m.baaEligible).length;
  const highRiskCount = manufacturers.filter((m) => m.pnsScore < 40).length;

  return (
    <div className={className} data-testid="political-dashboard">
      {/* Header stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2L3 6v6c0 4.42 2.99 8.53 7 9.5 4.01-.97 7-5.08 7-9.5V6l-7-4z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          }
          value={avgScore}
          label="Avg PNS Score"
          trend={
            avgScore >= 60
              ? { direction: 'up', value: 'Healthy' }
              : { direction: 'down', value: 'At Risk' }
          }
        />
        <StatCard
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M4 10l4 4 8-8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          value={baaCount}
          label="BAA Eligible Manufacturers"
        />
        <StatCard
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 6v4m0 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          }
          value={highRiskCount}
          label="High-Risk Manufacturers"
          trend={
            highRiskCount > 0
              ? { direction: 'down', value: `${highRiskCount} flagged` }
              : { direction: 'up', value: 'None' }
          }
        />
      </div>

      {/* PNS Score Table */}
      <Card className="mt-6">
        <h3 className="text-lg font-bold text-navy">
          Manufacturer PNS Scores
        </h3>
        <p className="mt-1 text-sm text-navy/60">
          Political & National Security scores for tracked manufacturers
        </p>

        {manufacturers.length === 0 ? (
          <p className="mt-4 text-center text-sm text-navy/40">
            No manufacturers tracked yet. Add products to see PNS scores.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-navy/10">
                  <th className="pb-2 pr-4 font-medium text-navy/60">Manufacturer</th>
                  <th className="pb-2 pr-4 font-medium text-navy/60">PNS Score</th>
                  <th className="pb-2 pr-4 font-medium text-navy/60">Products</th>
                  <th className="pb-2 pr-4 font-medium text-navy/60">Country</th>
                  <th className="pb-2 font-medium text-navy/60">BAA</th>
                </tr>
              </thead>
              <tbody>
                {manufacturers.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-navy/5 last:border-0"
                  >
                    <td className="py-3 pr-4 font-medium text-navy">
                      {m.name}
                    </td>
                    <td className="py-3 pr-4">
                      <ScoreRing score={m.pnsScore} size={48} />
                    </td>
                    <td className="py-3 pr-4 text-navy/70">{m.productCount}</td>
                    <td className="py-3 pr-4 text-navy/70">{m.primaryCountry}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          m.baaEligible
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {m.baaEligible ? 'Eligible' : 'Ineligible'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* V2 Placeholder Sections */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <ComingSoonCard
          title="Lobbying Data"
          description="Track manufacturer lobbying expenditures and legislative influence"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
        <ComingSoonCard
          title="PAC Contributions"
          description="Political Action Committee contributions by healthcare manufacturers"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
        <ComingSoonCard
          title="Revolving Door Tracker"
          description="Track personnel movement between government agencies and industry"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
      </div>
    </div>
  );
};

function ComingSoonCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div data-testid="coming-soon-card">
      <Card className="relative overflow-hidden">
        <div className="text-navy/30">{icon}</div>
        <h4 className="mt-3 text-base font-bold text-navy">{title}</h4>
        <p className="mt-1 text-sm text-navy/50">{description}</p>
        <div className="mt-3 inline-flex items-center rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
          Coming in V2
        </div>
      </Card>
    </div>
  );
}

export default PoliticalDashboard;
