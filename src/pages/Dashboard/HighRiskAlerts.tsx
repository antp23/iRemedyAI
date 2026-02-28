import { useMemo } from 'react';
import { BadgeRisk } from '@/components/design-system';
import type { DrugProduct, RiskLevel, DEASchedule } from '@/types';

interface HighRiskAlertsProps {
  products: DrugProduct[];
}

function scheduleToRiskLevel(schedule: DEASchedule): RiskLevel {
  switch (schedule) {
    case 'I':
    case 'II':
      return 'critical';
    case 'III':
      return 'high';
    case 'IV':
      return 'moderate';
    case 'V':
    case 'unscheduled':
      return 'low';
  }
}

function getRiskReason(product: DrugProduct): string {
  const risk = scheduleToRiskLevel(product.schedule);
  if (risk === 'critical') {
    return `DEA Schedule ${product.schedule} — controlled substance`;
  }
  if (risk === 'high') {
    return `DEA Schedule ${product.schedule} — elevated risk`;
  }
  return 'Flagged for review';
}

function getProductMIAScore(product: DrugProduct): number {
  const severityWeights: Record<string, number> = {
    contraindicated: 4,
    major: 3,
    moderate: 2,
    minor: 1,
  };
  return product.interactions.reduce(
    (sum, interaction) => sum + (severityWeights[interaction.severity] ?? 0),
    0,
  );
}

const HighRiskAlerts = ({ products }: HighRiskAlertsProps) => {
  const alertProducts = useMemo(() => {
    return products
      .filter((p) => {
        const risk = scheduleToRiskLevel(p.schedule);
        return risk === 'critical' || risk === 'high';
      })
      .sort((a, b) => {
        const riskOrder: Record<RiskLevel, number> = {
          critical: 0,
          high: 1,
          moderate: 2,
          low: 3,
        };
        return (
          riskOrder[scheduleToRiskLevel(a.schedule)] -
          riskOrder[scheduleToRiskLevel(b.schedule)]
        );
      });
  }, [products]);

  return (
    <div
      className="rounded-xl border border-navy/10 bg-white p-6 shadow-sm"
      data-testid="high-risk-alerts"
    >
      <h2 className="font-heading text-lg font-bold text-navy">
        High-Risk Alerts
      </h2>

      {alertProducts.length === 0 ? (
        <p className="mt-4 text-center text-navy/50">
          No high-risk products detected
        </p>
      ) : (
        <div className="mt-4 max-h-80 space-y-3 overflow-y-auto">
          {alertProducts.map((product) => {
            const risk = scheduleToRiskLevel(product.schedule);
            const mia = getProductMIAScore(product);

            return (
              <div
                key={product.id}
                className="rounded-lg border border-navy/5 p-3 transition-colors hover:bg-navy/[0.02]"
                data-testid="risk-alert-item"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-navy">
                      {product.name}
                    </p>
                    <p className="mt-0.5 text-xs text-navy/50">
                      {getRiskReason(product)}
                    </p>
                  </div>
                  <BadgeRisk level={risk} />
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-navy/60">
                  <span>MIA Score: {mia}</span>
                  <span className="text-navy/20">|</span>
                  <span>{product.manufacturer}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HighRiskAlerts;
