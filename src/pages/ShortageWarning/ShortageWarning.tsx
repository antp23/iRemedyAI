import { useState, useMemo } from 'react';
import { useProducts } from '@/hooks';
import { BadgeRisk, ScoreRing, StatCard } from '@/components/design-system';
import type { DrugProduct, RiskLevel } from '@/types';
import ShortageRadar from './ShortageRadar';
import AlternativeTracker from './AlternativeTracker';

/** V1 shortage risk factors derived from product data. */
export interface ShortageRiskFactors {
  isUnavailable: boolean;
  highRiskCountry: boolean;
  recentRecallRisk: boolean;
  singleSource: boolean;
  lowComplianceScore: boolean;
}

/** Compute per-product shortage risk factors. */
export function computeRiskFactors(
  product: DrugProduct,
  categoryCount: Map<string, number>,
): ShortageRiskFactors {
  const mfr = product.manufacturer.toLowerCase();
  const highRiskCountry =
    mfr.includes('china') ||
    mfr.includes('shanghai') ||
    mfr.includes('beijing') ||
    mfr.includes('zhejiang') ||
    mfr.includes('hubei') ||
    mfr.includes('xiamen') ||
    mfr.includes('cspc') ||
    mfr.includes('northeast pharmaceutical');

  const recentRecallRisk = product.warnings.length >= 2;
  const singleSource = (categoryCount.get(product.category) ?? 0) <= 1;
  const lowComplianceScore = !product.fdaApprovalDate || !product.lotNumber;

  return {
    isUnavailable: !product.isAvailable,
    highRiskCountry,
    recentRecallRisk,
    singleSource,
    lowComplianceScore,
  };
}

/** A product is flagged for shortage if it has 2+ risk factors OR is unavailable. */
export function isShortageProduct(factors: ShortageRiskFactors): boolean {
  if (factors.isUnavailable) return true;
  const riskCount = [
    factors.highRiskCountry,
    factors.recentRecallRisk,
    factors.singleSource,
    factors.lowComplianceScore,
  ].filter(Boolean).length;
  return riskCount >= 2;
}

/** Map shortage factor count to a risk level. */
export function shortageRiskLevel(factors: ShortageRiskFactors): RiskLevel {
  if (factors.isUnavailable) return 'critical';
  const count = [
    factors.highRiskCountry,
    factors.recentRecallRisk,
    factors.singleSource,
    factors.lowComplianceScore,
  ].filter(Boolean).length;
  if (count >= 3) return 'critical';
  if (count >= 2) return 'high';
  if (count >= 1) return 'moderate';
  return 'low';
}

const ShortageWarning = () => {
  const { products } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<DrugProduct | null>(null);

  const categoryCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      map.set(p.category, (map.get(p.category) ?? 0) + 1);
    }
    return map;
  }, [products]);

  const shortageProducts = useMemo(() => {
    return products
      .map((product) => ({
        product,
        factors: computeRiskFactors(product, categoryCount),
      }))
      .filter(({ factors }) => isShortageProduct(factors))
      .sort((a, b) => {
        const order: Record<RiskLevel, number> = { critical: 0, high: 1, moderate: 2, low: 3 };
        return order[shortageRiskLevel(a.factors)] - order[shortageRiskLevel(b.factors)];
      });
  }, [products, categoryCount]);

  const alternatives = useMemo(() => {
    if (!selectedProduct) return [];
    return products.filter(
      (p) =>
        p.id !== selectedProduct.id &&
        p.category === selectedProduct.category &&
        p.isAvailable,
    );
  }, [selectedProduct, products]);

  const stats = useMemo(() => {
    const critical = shortageProducts.filter(
      ({ factors }) => shortageRiskLevel(factors) === 'critical',
    ).length;
    const high = shortageProducts.filter(
      ({ factors }) => shortageRiskLevel(factors) === 'high',
    ).length;
    const unavailable = shortageProducts.filter(({ factors }) => factors.isUnavailable).length;
    return { total: shortageProducts.length, critical, high, unavailable };
  }, [shortageProducts]);

  if (products.length === 0) {
    return (
      <div className="p-8">
        <h1 className="font-heading text-3xl font-bold text-navy">Shortage Intelligence</h1>
        <div
          className="mt-8 rounded-xl border border-navy/10 bg-white p-12 text-center"
          data-testid="no-products"
        >
          <p className="text-lg text-navy/60">
            No products in your tracked portfolio. Add products to monitor shortage risk.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="shortage-warning-page">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-navy">Shortage Intelligence</h1>
        <p className="mt-1 text-navy/60">
          Active shortage indicators and risk monitoring for your tracked portfolio.
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<ShortageIcon />}
          value={stats.total}
          label="Flagged Products"
          className={stats.total > 0 ? 'border-l-4 border-l-[#E67E22]' : ''}
        />
        <StatCard
          icon={<CriticalIcon />}
          value={stats.critical}
          label="Critical Risk"
          className={stats.critical > 0 ? 'border-l-4 border-l-[#C0392B]' : ''}
        />
        <StatCard
          icon={<WarningIcon />}
          value={stats.high}
          label="High Risk"
          className={stats.high > 0 ? 'border-l-4 border-l-[#E67E22]' : ''}
        />
        <StatCard
          icon={<UnavailableIcon />}
          value={stats.unavailable}
          label="Currently Unavailable"
          className={stats.unavailable > 0 ? 'border-l-4 border-l-[#C0392B]' : ''}
        />
      </div>

      {shortageProducts.length === 0 ? (
        <div
          className="rounded-xl border border-navy/10 bg-white p-12 text-center"
          data-testid="no-shortages"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#27AE60]/10">
            <CheckIcon />
          </div>
          <p className="text-lg font-semibold text-navy">
            No active shortages in your tracked portfolio
          </p>
          <p className="mt-1 text-sm text-navy/50">
            All {products.length} tracked products are within normal risk parameters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Shortage product list */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 font-heading text-xl font-semibold text-navy">
              Active Shortage Indicators
            </h2>
            <div className="space-y-3" data-testid="shortage-list">
              {shortageProducts.map(({ product, factors }) => {
                const risk = shortageRiskLevel(factors);
                return (
                  <div
                    key={product.id}
                    className={`cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md ${
                      selectedProduct?.id === product.id
                        ? 'border-gold ring-2 ring-gold/20'
                        : 'border-navy/10'
                    }`}
                    onClick={() => setSelectedProduct(product)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedProduct(product);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    data-testid="shortage-product-item"
                  >
                    <div className="flex items-center gap-4">
                      <ScoreRing
                        score={factors.isUnavailable ? 0 : 100 - ([
                          factors.highRiskCountry,
                          factors.recentRecallRisk,
                          factors.singleSource,
                          factors.lowComplianceScore,
                        ].filter(Boolean).length * 25)}
                        size={48}
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-navy">
                          {product.name}
                        </h3>
                        <p className="text-xs text-navy/60">
                          {product.strength}{product.strengthUnit} &middot; {product.manufacturer}
                        </p>
                      </div>
                      <BadgeRisk level={risk} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {factors.isUnavailable && (
                        <RiskTag label="Unavailable" variant="critical" />
                      )}
                      {factors.highRiskCountry && (
                        <RiskTag label="High-Risk Country" variant="high" />
                      )}
                      {factors.recentRecallRisk && (
                        <RiskTag label="Recall Indicators" variant="high" />
                      )}
                      {factors.singleSource && (
                        <RiskTag label="Single Source" variant="moderate" />
                      )}
                      {factors.lowComplianceScore && (
                        <RiskTag label="Low Compliance" variant="moderate" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar: radar + alternatives */}
          <div className="space-y-6">
            {selectedProduct ? (
              <>
                <ShortageRadar
                  factors={computeRiskFactors(selectedProduct, categoryCount)}
                  productName={selectedProduct.name}
                />
                <AlternativeTracker
                  product={selectedProduct}
                  alternatives={alternatives}
                />
              </>
            ) : (
              <div className="rounded-xl border border-navy/10 bg-white p-8 text-center">
                <p className="text-sm text-navy/50">
                  Select a product to view risk radar and alternatives.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/** Small pill tag for risk factors. */
function RiskTag({ label, variant }: { label: string; variant: 'critical' | 'high' | 'moderate' }) {
  const colors = {
    critical: 'bg-[#C0392B]/10 text-[#C0392B]',
    high: 'bg-[#E67E22]/10 text-[#E67E22]',
    moderate: 'bg-[#F1C40F]/10 text-[#D4AC0D]',
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[variant]}`}
      data-testid="risk-tag"
    >
      {label}
    </span>
  );
}

function ShortageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2L18 18H2L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 8V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="15" r="0.75" fill="currentColor" />
    </svg>
  );
}

function CriticalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7L13 13M13 7L7 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2L18 18H2L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 9V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function UnavailableIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 10H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M9 16L14 21L23 11" stroke="#27AE60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default ShortageWarning;
