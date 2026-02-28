import { useMemo } from 'react';
import { useProducts } from '@/hooks';
import { ScoreRing, BadgeRisk, StatCard } from '@/components/design-system';
import type { DrugProduct, ProductCategory, RiskLevel } from '@/types';
import RiskHeatmap from './RiskHeatmap';
import FileUploader from './FileUploader';

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  analgesic: 'Analgesic',
  antibiotic: 'Antibiotic',
  antiviral: 'Antiviral',
  antifungal: 'Antifungal',
  cardiovascular: 'Cardiovascular',
  dermatological: 'Dermatological',
  endocrine: 'Endocrine',
  gastrointestinal: 'Gastrointestinal',
  immunological: 'Immunological',
  neurological: 'Neurological',
  oncological: 'Oncological',
  ophthalmic: 'Ophthalmic',
  psychiatric: 'Psychiatric',
  respiratory: 'Respiratory',
  musculoskeletal: 'Musculoskeletal',
  other: 'Other',
};

const RISK_WEIGHTS: Record<RiskLevel, number> = {
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4,
};

/** Map a DEA schedule to a RiskLevel. Mirrors store logic for local use. */
export function scheduleToRiskLevel(
  schedule: DrugProduct['schedule'],
): RiskLevel {
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

/** Compute a 0-100 numeric risk score for a single product. */
export function computeProductRiskScore(product: DrugProduct): number {
  const severityWeights: Record<string, number> = {
    contraindicated: 4,
    major: 3,
    moderate: 2,
    minor: 1,
  };

  const scheduleScore = RISK_WEIGHTS[scheduleToRiskLevel(product.schedule)];
  const interactionScore = product.interactions.reduce(
    (sum, i) => sum + (severityWeights[i.severity] ?? 0),
    0,
  );
  const controlledPenalty = product.isControlled ? 10 : 0;

  const raw = scheduleScore * 15 + Math.min(interactionScore * 5, 40) + controlledPenalty;
  return Math.min(100, Math.max(0, raw));
}

/** Return the top N products sorted by risk score descending. */
export function getTopRiskProducts(
  products: DrugProduct[],
  n: number,
): { product: DrugProduct; riskScore: number; riskLevel: RiskLevel }[] {
  return products
    .map((product) => ({
      product,
      riskScore: computeProductRiskScore(product),
      riskLevel: scheduleToRiskLevel(product.schedule),
    }))
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, n);
}

/** Recommended action based on risk level. */
function recommendedAction(level: RiskLevel): string {
  switch (level) {
    case 'critical':
      return 'Immediate review required — evaluate BAA-compliant alternatives';
    case 'high':
      return 'Schedule risk review within 30 days';
    case 'moderate':
      return 'Monitor and reassess at next quarterly review';
    case 'low':
      return 'No action needed — continue standard monitoring';
  }
}

/** Identify therapeutic categories with no BAA-eligible product. */
export function findBAAGaps(
  products: DrugProduct[],
): { category: ProductCategory; label: string }[] {
  const categoriesWithBaa = new Set<ProductCategory>();
  for (const p of products) {
    if (p.requiresPrescription && p.isAvailable) {
      categoriesWithBaa.add(p.category);
    }
  }

  const allCategories = new Set<ProductCategory>();
  for (const p of products) {
    allCategories.add(p.category);
  }

  const gaps: { category: ProductCategory; label: string }[] = [];
  for (const cat of allCategories) {
    if (!categoriesWithBaa.has(cat)) {
      gaps.push({ category: cat, label: CATEGORY_LABELS[cat] });
    }
  }
  return gaps.sort((a, b) => a.label.localeCompare(b.label));
}

/** Aggregate portfolio risk metrics. */
export function computeAggregateMetrics(products: DrugProduct[]) {
  if (products.length === 0) {
    return {
      overallScore: 0,
      highestRiskCategory: null as { category: ProductCategory; label: string; avgScore: number } | null,
      highRiskCountryPct: 0,
      totalProducts: 0,
      criticalCount: 0,
      highCount: 0,
    };
  }

  const totalScore = products.reduce(
    (sum, p) => sum + computeProductRiskScore(p),
    0,
  );
  const overallScore = Math.round(totalScore / products.length);

  // Risk by therapeutic category
  const categoryScores = new Map<ProductCategory, { total: number; count: number }>();
  for (const p of products) {
    const entry = categoryScores.get(p.category) ?? { total: 0, count: 0 };
    entry.total += computeProductRiskScore(p);
    entry.count += 1;
    categoryScores.set(p.category, entry);
  }

  let highestRiskCategory: { category: ProductCategory; label: string; avgScore: number } | null = null;
  let maxAvg = -1;
  for (const [cat, { total, count }] of categoryScores) {
    const avg = total / count;
    if (avg > maxAvg) {
      maxAvg = avg;
      highestRiskCategory = { category: cat, label: CATEGORY_LABELS[cat], avgScore: Math.round(avg) };
    }
  }

  // High-risk source: controlled substances or schedule I-III
  const highRiskCount = products.filter((p) => {
    const level = scheduleToRiskLevel(p.schedule);
    return level === 'critical' || level === 'high';
  }).length;
  const highRiskCountryPct = Math.round((highRiskCount / products.length) * 100);

  const criticalCount = products.filter(
    (p) => scheduleToRiskLevel(p.schedule) === 'critical',
  ).length;
  const highCount = products.filter(
    (p) => scheduleToRiskLevel(p.schedule) === 'high',
  ).length;

  return {
    overallScore,
    highestRiskCategory,
    highRiskCountryPct,
    totalProducts: products.length,
    criticalCount,
    highCount,
  };
}

const MIN_PRODUCTS = 5;

const RiskAnalyzer = () => {
  const { products, baaEligible } = useProducts();

  const metrics = useMemo(() => computeAggregateMetrics(products), [products]);
  const topRisk = useMemo(() => getTopRiskProducts(products, 10), [products]);
  const baaGaps = useMemo(() => findBAAGaps(products), [products]);

  if (products.length < MIN_PRODUCTS) {
    return (
      <div className="p-8">
        <h1 className="font-heading text-3xl font-bold text-navy">
          Portfolio Risk Analysis
        </h1>
        <div className="mt-8 rounded-xl border border-navy/10 bg-white p-10 text-center shadow-sm">
          <p className="text-lg text-navy/70">
            Add more products for meaningful risk analysis
          </p>
          <p className="mt-2 text-sm text-navy/50">
            At least {MIN_PRODUCTS} tracked products are required to generate
            portfolio-level insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl font-bold text-navy">
        Portfolio Risk Analysis
      </h1>
      <p className="mt-2 text-navy/70">
        Aggregate risk exposure across {metrics.totalProducts} tracked products.
      </p>

      {/* Aggregate Risk Dashboard */}
      <section aria-label="Risk summary" className="mt-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 2L2 18h16L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M10 8v4M10 14v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
            value={metrics.overallScore}
            label="Portfolio Risk Score"
          />
          <StatCard
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <rect x="2" y="2" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6 10h8M10 6v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
            value={metrics.highestRiskCategory?.label ?? 'N/A'}
            label="Highest-Risk Therapeutic Area"
          />
          <StatCard
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
            value={`${metrics.highRiskCountryPct}%`}
            label="High-Risk Products"
          />
          <StatCard
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M3 10l5 5L17 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            value={baaEligible.length}
            label="BAA-Eligible Products"
          />
        </div>

        {/* Score Ring */}
        <div className="mt-6 flex items-center gap-8 rounded-xl border border-navy/10 bg-white p-6 shadow-sm">
          <ScoreRing score={metrics.overallScore} label="Overall Risk" size={140} />
          <div className="flex flex-wrap gap-3">
            <div className="rounded-lg bg-[#C0392B]/5 px-4 py-2">
              <p className="text-2xl font-bold text-[#C0392B]">{metrics.criticalCount}</p>
              <p className="text-xs text-navy/60">Critical</p>
            </div>
            <div className="rounded-lg bg-[#E67E22]/5 px-4 py-2">
              <p className="text-2xl font-bold text-[#E67E22]">{metrics.highCount}</p>
              <p className="text-xs text-navy/60">High</p>
            </div>
            <div className="rounded-lg bg-[#27AE60]/5 px-4 py-2">
              <p className="text-2xl font-bold text-[#27AE60]">
                {metrics.totalProducts - metrics.criticalCount - metrics.highCount}
              </p>
              <p className="text-xs text-navy/60">Moderate / Low</p>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Concentration Heatmap */}
      <section aria-label="Risk heatmap" className="mt-8">
        <h2 className="font-heading text-xl font-bold text-navy">
          Concentration Heatmap
        </h2>
        <p className="mt-1 text-sm text-navy/60">
          Risk concentration by therapeutic category and source.
        </p>
        <div className="mt-4 rounded-xl border border-navy/10 bg-white p-6 shadow-sm">
          <RiskHeatmap products={products} />
        </div>
      </section>

      {/* Top 10 Highest-Risk Products */}
      <section aria-label="Top risk products" className="mt-8">
        <h2 className="font-heading text-xl font-bold text-navy">
          Top 10 Highest-Risk Products
        </h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-navy/10 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-navy/10 bg-navy/[0.02]">
                <th className="px-4 py-3 font-semibold text-navy/70">#</th>
                <th className="px-4 py-3 font-semibold text-navy/70">Product</th>
                <th className="px-4 py-3 font-semibold text-navy/70">Category</th>
                <th className="px-4 py-3 font-semibold text-navy/70">Risk Score</th>
                <th className="px-4 py-3 font-semibold text-navy/70">Risk Level</th>
                <th className="px-4 py-3 font-semibold text-navy/70">
                  Recommended Action
                </th>
              </tr>
            </thead>
            <tbody>
              {topRisk.map(({ product, riskScore, riskLevel }, idx) => (
                <tr
                  key={product.id}
                  className="border-b border-navy/5 last:border-none"
                >
                  <td className="px-4 py-3 font-medium text-navy/50">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-navy">{product.name}</p>
                    <p className="text-xs text-navy/50">{product.manufacturer}</p>
                  </td>
                  <td className="px-4 py-3 text-navy/70">
                    {CATEGORY_LABELS[product.category]}
                  </td>
                  <td className="px-4 py-3 font-semibold text-navy">
                    {riskScore}
                  </td>
                  <td className="px-4 py-3">
                    <BadgeRisk level={riskLevel} />
                  </td>
                  <td className="px-4 py-3 text-xs text-navy/60">
                    {recommendedAction(riskLevel)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Made in America Gap Analysis */}
      <section aria-label="BAA gap analysis" className="mt-8">
        <h2 className="font-heading text-xl font-bold text-navy">
          Made in America Gap Analysis
        </h2>
        <p className="mt-1 text-sm text-navy/60">
          Therapeutic areas where no BAA-eligible option exists.
        </p>
        {baaGaps.length === 0 ? (
          <div className="mt-4 rounded-xl border border-[#27AE60]/20 bg-[#27AE60]/5 p-6 text-center">
            <p className="font-medium text-[#27AE60]">
              All therapeutic areas have at least one BAA-eligible product.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {baaGaps.map(({ category, label }) => (
              <div
                key={category}
                className="flex items-center gap-3 rounded-xl border border-[#C0392B]/15 bg-[#C0392B]/5 p-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C0392B]/10">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M8 3v5M8 10v1"
                      stroke="#C0392B"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle cx="8" cy="8" r="7" stroke="#C0392B" strokeWidth="1.5" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-navy">{label}</p>
                  <p className="text-xs text-[#C0392B]">No BAA-eligible option</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* File Uploader */}
      <section aria-label="File upload" className="mt-8 mb-8">
        <h2 className="font-heading text-xl font-bold text-navy">
          Batch Upload
        </h2>
        <div className="mt-4">
          <FileUploader />
        </div>
      </section>
    </div>
  );
};

export default RiskAnalyzer;
