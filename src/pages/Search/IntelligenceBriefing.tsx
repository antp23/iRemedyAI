import type { DrugProduct, DEASchedule, RiskLevel } from '@/types';
import { ScoreRing, BadgeBAA, BadgeRisk } from '@/components/design-system';
import { ComplianceGrid } from '@/components/shared';
import type { ComplianceStatusGrid } from '@/components/shared';

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

function computeMIAScore(product: DrugProduct): number {
  let score = 70;

  const manufacturer = product.manufacturer.toLowerCase();
  if (manufacturer.includes('usa') || manufacturer.includes('u.s.')) {
    score += 20;
  } else if (
    manufacturer.includes('puerto rico') ||
    manufacturer.includes('israel') ||
    manufacturer.includes('ireland') ||
    manufacturer.includes('germany') ||
    manufacturer.includes('japan') ||
    manufacturer.includes('canada')
  ) {
    score += 12;
  } else if (manufacturer.includes('india')) {
    score += 5;
  }

  const severityPenalty: Record<string, number> = {
    contraindicated: 8,
    major: 5,
    moderate: 3,
    minor: 1,
  };
  for (const interaction of product.interactions) {
    score -= severityPenalty[interaction.severity] ?? 0;
  }

  if (product.requiresPrescription && product.isAvailable) {
    score += 3;
  }

  if (product.isControlled) {
    score -= 5;
  }

  return Math.max(0, Math.min(100, score));
}

function extractCountry(manufacturer: string): { name: string; code: string } {
  const m = manufacturer.toLowerCase();
  const mapping: { keyword: string; name: string; code: string }[] = [
    { keyword: 'usa', name: 'United States', code: 'US' },
    { keyword: 'u.s.', name: 'United States', code: 'US' },
    { keyword: ', usa', name: 'United States', code: 'US' },
    { keyword: 'puerto rico', name: 'Puerto Rico', code: 'PR' },
    { keyword: 'india', name: 'India', code: 'IN' },
    { keyword: 'china', name: 'China', code: 'CN' },
    { keyword: 'israel', name: 'Israel', code: 'IL' },
    { keyword: 'ireland', name: 'Ireland', code: 'IE' },
    { keyword: 'germany', name: 'Germany', code: 'DE' },
    { keyword: 'japan', name: 'Japan', code: 'JP' },
    { keyword: 'canada', name: 'Canada', code: 'CA' },
  ];

  for (const entry of mapping) {
    if (m.includes(entry.keyword)) {
      return { name: entry.name, code: entry.code };
    }
  }

  return { name: 'United States', code: 'US' };
}

interface IntelligenceBriefingProps {
  product: DrugProduct;
  onClose: () => void;
}

const IntelligenceBriefing = ({ product, onClose }: IntelligenceBriefingProps) => {
  const riskLevel = scheduleToRiskLevel(product.schedule);
  const miaScore = computeMIAScore(product);
  const country = extractCountry(product.manufacturer);
  const baaEligible = product.requiresPrescription && product.isAvailable;

  const complianceStatus: ComplianceStatusGrid = {
    baaCompliant: baaEligible,
    taaCompliant:
      country.code === 'US' ||
      country.code === 'PR' ||
      ['IL', 'IE', 'DE', 'JP', 'CA'].includes(country.code),
    fdaApproved: !!product.fdaApprovalDate,
    riskLevel,
  };

  const notableEvents: string[] = [];
  if (product.isControlled) {
    notableEvents.push(`DEA Schedule ${product.schedule} controlled substance`);
  }
  if (product.interactions.length > 0) {
    const severe = product.interactions.filter(
      (i) => i.severity === 'major' || i.severity === 'contraindicated',
    );
    if (severe.length > 0) {
      notableEvents.push(
        `${severe.length} critical drug interaction${severe.length > 1 ? 's' : ''} identified`,
      );
    }
  }
  if (product.warnings.length > 1) {
    notableEvents.push(`${product.warnings.length} active safety warnings`);
  }
  if (!product.isAvailable) {
    notableEvents.push('Product currently unavailable / supply disruption');
  }

  return (
    <div
      className="rounded-2xl border border-navy/10 bg-white shadow-lg"
      data-testid="intelligence-briefing"
    >
      {/* Header */}
      <div className="rounded-t-2xl bg-navy px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">
              Drug Intelligence Profile
            </p>
            <h2 className="mt-1 font-heading text-xl font-bold text-offWhite">
              {product.brandName}
            </h2>
            <p className="text-sm text-offWhite/70">
              {product.genericName} &middot; NDC {product.ndc}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-offWhite/60 transition-colors hover:bg-offWhite/10 hover:text-offWhite"
            aria-label="Close briefing"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {/* Score & Risk Summary */}
        <div className="flex items-center gap-6">
          <ScoreRing score={miaScore} label="MIA Score" size={96} />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <BadgeRisk level={riskLevel} />
              <BadgeBAA eligible={baaEligible} />
            </div>
            <p className="text-sm text-navy/70">
              {product.dosageForm} &middot; {product.strength}
              {product.strengthUnit} &middot;{' '}
              {product.routeOfAdministration}
            </p>
            <p className="text-xs text-navy/50">
              {product.manufacturer}
            </p>
          </div>
        </div>

        {/* Origin Analysis */}
        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-navy/50">
            Origin Analysis
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-navy/10 bg-offWhite p-3">
              <p className="text-xs text-navy/50">Manufacturer</p>
              <p className="text-sm font-medium text-navy">
                {product.manufacturer}
              </p>
            </div>
            <div className="rounded-lg border border-navy/10 bg-offWhite p-3">
              <p className="text-xs text-navy/50">Origin Country</p>
              <p className="text-sm font-medium text-navy">{country.name}</p>
            </div>
            <div className="rounded-lg border border-navy/10 bg-offWhite p-3">
              <p className="text-xs text-navy/50">Product Type</p>
              <p className="text-sm font-medium capitalize text-navy">
                {product.productType}
              </p>
            </div>
            <div className="rounded-lg border border-navy/10 bg-offWhite p-3">
              <p className="text-xs text-navy/50">Category</p>
              <p className="text-sm font-medium capitalize text-navy">
                {product.category}
              </p>
            </div>
          </div>
        </div>

        {/* Compliance Status */}
        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-navy/50">
            Compliance Status
          </h3>
          <ComplianceGrid status={complianceStatus} />
        </div>

        {/* Notable Events */}
        {notableEvents.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-navy/50">
              Notable Events
            </h3>
            <ul className="space-y-2">
              {notableEvents.map((event) => (
                <li
                  key={event}
                  className="flex items-start gap-2 rounded-lg border border-gold/20 bg-gold/5 px-3 py-2 text-sm text-navy"
                >
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M8 1L10.2 5.5L15 6.2L11.5 9.6L12.4 14.4L8 12.1L3.6 14.4L4.5 9.6L1 6.2L5.8 5.5L8 1Z"
                      fill="currentColor"
                    />
                  </svg>
                  {event}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Drug Interactions */}
        {product.interactions.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-navy/50">
              Drug Interactions
            </h3>
            <div className="space-y-2">
              {product.interactions.map((interaction) => (
                <div
                  key={interaction.drugName}
                  className="rounded-lg border border-navy/10 bg-offWhite p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-navy">
                      {interaction.drugName}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        interaction.severity === 'contraindicated'
                          ? 'bg-red-100 text-red-700'
                          : interaction.severity === 'major'
                            ? 'bg-orange-100 text-orange-700'
                            : interaction.severity === 'moderate'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {interaction.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-navy/60">
                    {interaction.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Ingredients */}
        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-navy/50">
            Active Ingredients
          </h3>
          <div className="flex flex-wrap gap-2">
            {product.activeIngredients.map((ai) => (
              <span
                key={ai.name}
                className="rounded-full border border-navy/10 bg-offWhite px-3 py-1 text-xs font-medium text-navy"
              >
                {ai.name} {ai.strength}
                {ai.unit}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceBriefing;
export { scheduleToRiskLevel, computeMIAScore, extractCountry };
