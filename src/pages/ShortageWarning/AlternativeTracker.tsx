import { useMemo } from 'react';
import { ScoreRing, BadgeRisk } from '@/components/design-system';
import { calculateCOORS, calculateQRS, getCountryScore } from '@/services/scoring';
import type { DrugProduct, RiskLevel } from '@/types';

interface AlternativeTrackerProps {
  product: DrugProduct;
  alternatives: DrugProduct[];
  className?: string;
}

interface ScoredAlternative {
  product: DrugProduct;
  complianceScore: number;
  riskLevel: RiskLevel;
  matchType: 'exact' | 'therapeutic';
}

function scoreToRisk(score: number): RiskLevel {
  if (score >= 80) return 'low';
  if (score >= 60) return 'moderate';
  if (score >= 30) return 'high';
  return 'critical';
}

/** Check if two products share an active ingredient (exact equivalents). */
function sharesActiveIngredient(a: DrugProduct, b: DrugProduct): boolean {
  const aNames = new Set(a.activeIngredients.map((ai) => ai.name.toLowerCase()));
  return b.activeIngredients.some((ai) => aNames.has(ai.name.toLowerCase()));
}

/** Calculate a composite compliance score for an alternative product. */
function calculateComplianceScore(product: DrugProduct): number {
  const coors = calculateCOORS(product);
  const qrs = calculateQRS(product);
  const countryScore = getCountryScore(
    extractCountryFromMfr(product.manufacturer),
  );

  // Compliance = weighted blend of COORS (40%), QRS (40%), country (20%)
  return Math.round(coors.overallScore * 0.4 + qrs.overallScore * 0.4 + countryScore * 0.2);
}

function extractCountryFromMfr(manufacturer: string): string {
  const lower = manufacturer.toLowerCase();
  if (lower.includes('usa') || lower.includes('u.s.') || lower.includes('united states')) return 'US';
  if (lower.includes('india') || lower.includes('hyderabad') || lower.includes('mumbai')) return 'India';
  if (lower.includes('china') || lower.includes('shanghai') || lower.includes('beijing')) return 'China';
  if (lower.includes('puerto rico')) return 'Puerto Rico';
  if (lower.includes('israel')) return 'Israel';
  if (lower.includes('ireland')) return 'Ireland';
  if (lower.includes('germany')) return 'Germany';
  if (lower.includes('japan')) return 'Japan';
  if (lower.includes('canada')) return 'Canada';
  return 'Unknown';
}

const AlternativeTracker = ({
  product,
  alternatives,
  className = '',
}: AlternativeTrackerProps) => {
  const scoredAlternatives = useMemo<ScoredAlternative[]>(() => {
    return alternatives
      .map((alt) => {
        const complianceScore = calculateComplianceScore(alt);
        const matchType = sharesActiveIngredient(product, alt) ? 'exact' : 'therapeutic';
        return {
          product: alt,
          complianceScore,
          riskLevel: scoreToRisk(complianceScore),
          matchType,
        } as ScoredAlternative;
      })
      .sort((a, b) => {
        // Sort exact matches first, then by compliance score descending
        if (a.matchType !== b.matchType) {
          return a.matchType === 'exact' ? -1 : 1;
        }
        return b.complianceScore - a.complianceScore;
      });
  }, [product, alternatives]);

  return (
    <div
      className={`rounded-xl border border-navy/10 bg-white p-5 ${className}`}
      data-testid="alternative-tracker"
    >
      <h3 className="mb-1 font-heading text-sm font-semibold text-navy">
        Alternative Products
      </h3>
      <p className="mb-4 truncate text-xs text-navy/50">
        Therapeutically equivalent options for {product.name}
      </p>

      {scoredAlternatives.length === 0 ? (
        <div className="py-6 text-center" data-testid="no-alternatives">
          <p className="text-sm text-navy/50">
            No alternatives found in the same therapeutic category.
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-testid="alternatives-list">
          {scoredAlternatives.map((alt) => (
            <div
              key={alt.product.id}
              className="flex items-center gap-3 rounded-lg border border-navy/5 bg-offWhite/50 p-3"
              data-testid="alternative-item"
            >
              <ScoreRing
                score={alt.complianceScore}
                size={40}
                label=""
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="truncate text-xs font-semibold text-navy">
                    {alt.product.name}
                  </h4>
                  <MatchBadge type={alt.matchType} />
                </div>
                <p className="text-[11px] text-navy/50">
                  {alt.product.strength}{alt.product.strengthUnit} &middot;{' '}
                  {alt.product.manufacturer}
                </p>
                <p className="mt-0.5 text-[11px] text-navy/40">
                  ${alt.product.price.toFixed(2)} &middot;{' '}
                  {alt.product.isAvailable ? 'In Stock' : 'Unavailable'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <BadgeRisk level={alt.riskLevel} />
                <span className="text-[10px] font-medium text-navy/40">
                  {alt.complianceScore}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {scoredAlternatives.length > 0 && (
        <div className="mt-4 rounded-lg bg-navy/5 p-3">
          <p className="text-[11px] text-navy/60">
            <span className="font-semibold">{scoredAlternatives.length}</span> alternative
            {scoredAlternatives.length !== 1 ? 's' : ''} found.{' '}
            <span className="font-semibold">
              {scoredAlternatives.filter((a) => a.matchType === 'exact').length}
            </span>{' '}
            exact match{scoredAlternatives.filter((a) => a.matchType === 'exact').length !== 1 ? 'es' : ''},{' '}
            <span className="font-semibold">
              {scoredAlternatives.filter((a) => a.matchType === 'therapeutic').length}
            </span>{' '}
            therapeutic equivalent{scoredAlternatives.filter((a) => a.matchType === 'therapeutic').length !== 1 ? 's' : ''}.
          </p>
        </div>
      )}
    </div>
  );
};

function MatchBadge({ type }: { type: 'exact' | 'therapeutic' }) {
  return (
    <span
      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
        type === 'exact'
          ? 'bg-[#27AE60]/10 text-[#27AE60]'
          : 'bg-navy/5 text-navy/50'
      }`}
      data-testid="match-badge"
    >
      {type === 'exact' ? 'Exact' : 'Therapeutic'}
    </span>
  );
}

export default AlternativeTracker;
