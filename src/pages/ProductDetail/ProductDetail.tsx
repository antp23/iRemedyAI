import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts, useScoring } from '@/hooks';
import { ScoreRing, BadgeRisk } from '@/components/design-system';
import { ConfidenceMeter } from '@/components/shared';
import type { SupplyChainNode } from '@/components/shared';
import type { ComplianceStatusGrid } from '@/components/shared';
import { Card, LoadingSpinner } from '@/components/ui';
import type { DrugProduct, RiskLevel } from '@/types';
import { isBAAEligible, isTAACountry, getCountryScore } from '@/services/scoring';
import ScoreDashboard from './ScoreDashboard';
import CompliancePanel from './CompliancePanel';
import OriginMap from './OriginMap';
import PricingPanel from './PricingPanel';

// Extend DrugProduct for seed products that have explicit origin fields
interface ProductWithOrigin extends DrugProduct {
  apiCountry?: string;
  fgCountry?: string;
  dataSource?: string;
}

const countryToCode: Record<string, string> = {
  US: 'US',
  'United States': 'US',
  USA: 'US',
  India: 'IN',
  China: 'CN',
  'Puerto Rico': 'PR',
  Israel: 'IL',
  Ireland: 'IE',
  Germany: 'DE',
  Switzerland: 'CH',
  Japan: 'JP',
  Canada: 'CA',
  'United Kingdom': 'GB',
  UK: 'GB',
  Unknown: 'UN',
};

function extractCountryFromManufacturer(manufacturer: string): string {
  const lower = manufacturer.toLowerCase();
  if (lower.includes('usa') || lower.includes('u.s.') || lower.includes('united states')) return 'US';
  if (lower.includes('india') || lower.includes('hyderabad') || lower.includes('mumbai')) return 'India';
  if (lower.includes('china') || lower.includes('shanghai') || lower.includes('beijing')) return 'China';
  if (lower.includes('puerto rico')) return 'Puerto Rico';
  if (lower.includes('israel')) return 'Israel';
  if (lower.includes('ireland')) return 'Ireland';
  if (lower.includes('germany')) return 'Germany';
  if (lower.includes('switzerland')) return 'Switzerland';
  if (lower.includes('japan')) return 'Japan';
  if (lower.includes('canada')) return 'Canada';
  if (lower.includes('uk') || lower.includes('united kingdom')) return 'United Kingdom';
  return 'Unknown';
}

function getCountryCode(country: string): string {
  return countryToCode[country] ?? country.slice(0, 2).toUpperCase();
}

function riskFromScore(score: number): RiskLevel {
  if (score >= 80) return 'low';
  if (score >= 60) return 'moderate';
  if (score >= 30) return 'high';
  return 'critical';
}

function buildSupplyChainNodes(
  apiCountry: string,
  fgCountry: string,
): SupplyChainNode[] {
  const nodes: SupplyChainNode[] = [];
  const apiCode = getCountryCode(apiCountry);
  const fgCode = getCountryCode(fgCountry);

  nodes.push({
    country: apiCountry,
    countryCode: apiCode,
    role: 'api-manufacturer',
    riskLevel: riskFromScore(getCountryScore(apiCountry)),
  });

  if (fgCountry !== apiCountry) {
    nodes.push({
      country: fgCountry,
      countryCode: fgCode,
      role: 'finished-goods',
      riskLevel: riskFromScore(getCountryScore(fgCountry)),
    });
  } else {
    nodes.push({
      country: fgCountry,
      countryCode: fgCode,
      role: 'finished-goods',
      riskLevel: riskFromScore(getCountryScore(fgCountry)),
    });
  }

  // Add US as distributor/HQ if not already represented
  if (apiCode !== 'US' && fgCode !== 'US') {
    nodes.push({
      country: 'United States',
      countryCode: 'US',
      role: 'distributor',
      riskLevel: 'low',
    });
  } else if (apiCode === 'US' || fgCode === 'US') {
    // If one node is already US, add distributor as US
    nodes.push({
      country: 'United States',
      countryCode: 'US',
      role: 'distributor',
      riskLevel: 'low',
    });
  }

  return nodes;
}

function buildComplianceNotes(
  baa: boolean,
  taaApi: boolean,
  taaFg: boolean,
  fdaApproved: boolean,
  miaRecommendation: string,
  gaps: { description: string }[],
): string[] {
  const notes: string[] = [];

  if (baa) {
    notes.push('Product meets Buy American Act (BAA) requirements for government procurement.');
  } else {
    notes.push('Product does NOT meet BAA eligibility. MIA score below 75 or FG not manufactured in the US.');
  }

  if (taaApi && taaFg) {
    notes.push('Both API and finished goods originate from TAA-designated countries.');
  } else if (taaApi) {
    notes.push('API originates from a TAA-designated country, but finished goods do not.');
  } else if (taaFg) {
    notes.push('Finished goods originate from a TAA-designated country, but API does not.');
  } else {
    notes.push('Neither API nor finished goods originate from TAA-designated countries.');
  }

  if (fdaApproved) {
    notes.push('FDA approval date documented.');
  } else {
    notes.push('No FDA approval date on record — verify regulatory status.');
  }

  if (miaRecommendation) {
    notes.push(miaRecommendation);
  }

  for (const gap of gaps) {
    notes.push(gap.description);
  }

  return notes;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getById } = useProducts();
  const { calculateMIA, calculateCOORS, calculateQRS, calculatePNS, calculateOverallRisk } = useScoring();

  const product = id ? getById(id) : undefined;

  const scores = useMemo(() => {
    if (!product) return null;

    const p = product as ProductWithOrigin;
    const apiCountry = p.apiCountry ?? extractCountryFromManufacturer(p.manufacturer);
    const fgCountry = p.fgCountry ?? extractCountryFromManufacturer(p.manufacturer);

    const mia = calculateMIA(apiCountry, fgCountry);
    const coors = calculateCOORS(product);
    const qrs = calculateQRS(product);
    const pns = calculatePNS(product);
    const overallRisk = calculateOverallRisk(mia, coors, qrs);

    const baa = isBAAEligible(mia.overallScore, fgCountry);
    const taaApi = isTAACountry(apiCountry);
    const taaFg = isTAACountry(fgCountry);
    const fdaApproved = !!product.fdaApprovalDate;

    const compliance: ComplianceStatusGrid = {
      baaCompliant: baa,
      taaCompliant: taaApi && taaFg,
      fdaApproved,
      riskLevel: overallRisk,
    };

    const complianceNotes = buildComplianceNotes(
      baa,
      taaApi,
      taaFg,
      fdaApproved,
      mia.recommendation,
      coors.gaps,
    );

    const supplyChainNodes = buildSupplyChainNodes(apiCountry, fgCountry);

    // Derive pricing: WAC = product price, AWP ~= WAC * 1.2 (standard markup), FSS = null (not available)
    const wac = product.price;
    const awp = Math.round(product.price * 1.2 * 100) / 100;

    // Confidence based on data completeness
    const dataPoints = [
      !!product.fdaApprovalDate,
      !!product.lotNumber,
      !!product.barcode,
      !!product.ndc,
      product.activeIngredients.length > 0,
      !!product.labelerName,
      p.apiCountry !== undefined,
      p.fgCountry !== undefined,
    ];
    const overallConfidence = Math.round((dataPoints.filter(Boolean).length / dataPoints.length) * 100);
    const originConfidence = p.apiCountry && p.fgCountry ? 95 : 55;

    // Intelligence notes for agent-researched products
    const intelligenceNotes: string[] = [];
    if (p.dataSource === 'SEED') {
      intelligenceNotes.push(
        'This product was analyzed using the iRemedy AI scoring engine with verified origin data.',
      );
      intelligenceNotes.push(
        `API sourced from ${apiCountry}, finished goods from ${fgCountry}.`,
      );
      intelligenceNotes.push(
        `Scoring methodology: MIA (60% API + 40% FG country weighting), COORS (supply chain + regulatory + documentation + tracking + quality system), QRS (efficacy + safety + satisfaction + outcomes + evidence), PNS (pricing + access + formulary + cost barriers + documentation).`,
      );
    }
    if (mia.categoryScores.length > 0) {
      for (const cat of mia.categoryScores) {
        if (cat.findings.length > 0) {
          intelligenceNotes.push(...cat.findings);
        }
      }
    }

    return {
      mia,
      coors,
      qrs,
      pns,
      overallRisk,
      compliance,
      complianceNotes,
      supplyChainNodes,
      awp,
      wac,
      overallConfidence,
      originConfidence,
      intelligenceNotes,
      apiCountry,
      fgCountry,
    };
  }, [product, calculateMIA, calculateCOORS, calculateQRS, calculatePNS, calculateOverallRisk]);

  if (!product) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4" data-testid="product-not-found">
        <p className="text-lg font-medium text-navy/60">Product not found</p>
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!scores) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="product-detail">
      {/* Product Header */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <ScoreRing score={scores.mia.overallScore} label="MIA" size={110} />
            <div>
              <h1 className="text-2xl font-bold text-navy">{product.name}</h1>
              <p className="mt-1 text-sm text-navy/60">
                {product.strength} {product.strengthUnit} &middot; {product.dosageForm}
              </p>
              <p className="text-sm text-navy/50">{product.manufacturer}</p>
              {product.ndc && (
                <p className="mt-1 text-xs text-navy/40">NDC: {product.ndc}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BadgeRisk level={scores.overallRisk} />
          </div>
        </div>
      </Card>

      {/* Score Dashboard */}
      <ScoreDashboard
        mia={scores.mia.overallScore}
        coors={scores.coors.overallScore}
        qrs={scores.qrs.overallScore}
        pns={scores.pns.overallScore}
      />

      {/* Two-column layout for Compliance + Pricing */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CompliancePanel
          status={scores.compliance}
          notes={scores.complianceNotes}
        />
        <PricingPanel
          awp={scores.awp}
          wac={scores.wac}
          fss={null}
          currency={product.currency}
        />
      </div>

      {/* Supply Chain Origin Map */}
      <OriginMap nodes={scores.supplyChainNodes} />

      {/* Confidence Meters */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-navy">Confidence Scoring</h2>
        <div className="grid gap-4 sm:grid-cols-2" data-testid="confidence-section">
          <ConfidenceMeter
            confidence={scores.overallConfidence}
            label="Overall Data Confidence"
          />
          <ConfidenceMeter
            confidence={scores.originConfidence}
            label="Origin Confidence"
          />
        </div>
      </Card>

      {/* Intelligence Notes */}
      {scores.intelligenceNotes.length > 0 && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-navy">Origin Intelligence Notes</h2>
          <div className="space-y-2" data-testid="intelligence-notes">
            {scores.intelligenceNotes.map((note, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-navy/70"
              >
                <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-navy/30" />
                {note}
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-offWhite p-3">
            <p className="text-xs text-navy/50">
              Sources: iRemedy AI Scoring Engine, FDA NDC Directory, TAA Designated Country List, BAA Compliance Database
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProductDetail;
