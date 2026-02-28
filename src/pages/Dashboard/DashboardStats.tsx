import { StatCard, ScoreRing } from '@/components/design-system';
import type { DrugProduct } from '@/types';

interface DashboardStatsProps {
  products: DrugProduct[];
  baaEligible: DrugProduct[];
  highRisk: DrugProduct[];
  averageMIA: number;
}

const DashboardStats = ({
  products,
  baaEligible,
  highRisk,
  averageMIA,
}: DashboardStatsProps) => {
  const total = products.length;
  const baaCount = baaEligible.length;
  const baaPercent = total > 0 ? Math.round((baaCount / total) * 100) : 0;
  const highRiskCount = highRisk.length;

  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      data-testid="dashboard-stats"
    >
      <StatCard
        icon={
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm-2 4a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
        }
        value={total.toLocaleString()}
        label="Total Products"
      />
      <StatCard
        icon={
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        }
        value={baaCount.toLocaleString()}
        label="BAA Eligible"
        trend={{
          direction: 'neutral',
          value: `${baaPercent}%`,
        }}
      />
      <StatCard
        icon={
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        }
        value={highRiskCount.toLocaleString()}
        label="High Risk"
        className="border-[#C0392B]/20 bg-[#C0392B]/5"
      />
      <div
        className="flex items-center justify-between rounded-xl border border-navy/10 bg-white p-5 shadow-sm"
        data-testid="stat-card-mia"
      >
        <div>
          <p className="text-sm text-navy/60">Average MIA Score</p>
          <p className="mt-1 text-2xl font-bold text-navy">{averageMIA}</p>
        </div>
        <ScoreRing
          score={Math.min(averageMIA * 10, 100)}
          label="MIA"
          size={72}
        />
      </div>
    </div>
  );
};

export default DashboardStats;
