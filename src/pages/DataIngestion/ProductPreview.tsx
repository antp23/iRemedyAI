import { useState } from 'react';
import { useProducts } from '@/hooks';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ScoreRing, BadgeBAA, BadgeRisk } from '@/components/design-system';
import type { DrugProduct, RiskLevel } from '@/types';

interface ProductPreviewProps {
  data: Record<string, unknown>;
  onConfirm: () => void;
  onDiscard: () => void;
}

function extractString(obj: Record<string, unknown>, keys: string[], fallback: string): string {
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === 'string' && val.length > 0) return val;
  }
  return fallback;
}

function extractNumber(obj: Record<string, unknown>, keys: string[], fallback: number): number {
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const parsed = parseFloat(val);
      if (!isNaN(parsed)) return parsed;
    }
  }
  return fallback;
}

function extractBoolean(obj: Record<string, unknown>, keys: string[], fallback: boolean): boolean {
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === 'boolean') return val;
  }
  return fallback;
}

function flattenAgentData(data: Record<string, unknown>): Record<string, unknown> {
  const flat: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(flat, val as Record<string, unknown>);
    } else {
      flat[key] = val;
    }
  }
  return flat;
}

function mapRiskLevel(level: string | undefined): RiskLevel {
  if (!level) return 'low';
  const lower = level.toLowerCase();
  if (lower === 'critical') return 'critical';
  if (lower === 'high') return 'high';
  if (lower === 'moderate' || lower === 'medium') return 'moderate';
  return 'low';
}

function buildDrugProduct(data: Record<string, unknown>): DrugProduct {
  const flat = flattenAgentData(data);
  const now = new Date().toISOString();

  return {
    id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ndc: extractString(flat, ['ndc', 'ndcCode', 'NDC'], '0000-0000-00'),
    name: extractString(flat, ['drugName', 'name', 'productName', 'brandName'], 'Unknown Drug'),
    brandName: extractString(flat, ['brandName', 'brand', 'tradeName'], ''),
    genericName: extractString(flat, ['genericName', 'generic', 'inn'], ''),
    labelerName: extractString(flat, ['labelerName', 'labeler', 'manufacturer'], ''),
    manufacturer: extractString(flat, ['manufacturer', 'labelerName', 'mfr'], 'Unknown'),
    productType: 'prescription',
    category: 'other',
    schedule: 'unscheduled',
    routeOfAdministration: extractString(flat, ['routeOfAdministration', 'route'], 'oral') as DrugProduct['routeOfAdministration'],
    dosageForm: extractString(flat, ['dosageForm', 'form', 'dosage_form'], ''),
    strength: extractString(flat, ['strength', 'dose'], ''),
    strengthUnit: extractString(flat, ['strengthUnit', 'unit'], 'mg'),
    packageSize: extractString(flat, ['packageSize', 'package'], ''),
    packageType: extractString(flat, ['packageType'], ''),
    description: extractString(flat, ['description', 'summary'], ''),
    activeIngredients: Array.isArray(flat.activeIngredients)
      ? (flat.activeIngredients as DrugProduct['activeIngredients'])
      : [],
    inactiveIngredients: Array.isArray(flat.inactiveIngredients)
      ? (flat.inactiveIngredients as string[])
      : [],
    indications: Array.isArray(flat.indications) ? (flat.indications as string[]) : [],
    contraindications: Array.isArray(flat.contraindications) ? (flat.contraindications as string[]) : [],
    warnings: Array.isArray(flat.warnings) ? (flat.warnings as string[]) : [],
    sideEffects: Array.isArray(flat.sideEffects) ? (flat.sideEffects as string[]) : [],
    interactions: Array.isArray(flat.interactions)
      ? (flat.interactions as DrugProduct['interactions'])
      : [],
    storageConditions: extractString(flat, ['storageConditions', 'storage'], ''),
    requiresPrescription: extractBoolean(flat, ['requiresPrescription'], true),
    isControlled: extractBoolean(flat, ['isControlled'], false),
    isAvailable: true,
    price: extractNumber(flat, ['wacPrice', 'price', 'awpPrice', 'cost'], 0),
    currency: 'USD',
    fdaApprovalDate: extractString(flat, ['fdaApprovalDate', 'approvalDate'], ''),
    createdAt: now,
    updatedAt: now,
  };
}

interface ScoreCardData {
  label: string;
  score: number;
  description: string;
}

function extractScores(data: Record<string, unknown>): ScoreCardData[] {
  const flat = flattenAgentData(data);
  const scores: ScoreCardData[] = [];

  const mia = extractNumber(flat, ['miaScore', 'mia_score'], -1);
  if (mia >= 0) {
    scores.push({ label: 'MIA', score: mia, description: 'Made In America Score' });
  }

  const coors = extractNumber(flat, ['coorsScore', 'coors_score', 'coorScore'], -1);
  if (coors >= 0) {
    scores.push({ label: 'COORS', score: coors, description: 'Country of Origin Risk Score' });
  }

  const qrs = extractNumber(flat, ['qrsScore', 'qrs_score', 'qualityScore'], -1);
  if (qrs >= 0) {
    scores.push({ label: 'QRS', score: qrs, description: 'Quality Rating Score' });
  }

  const pns = extractNumber(flat, ['pnsScore', 'pns_score', 'pricingScore'], -1);
  if (pns >= 0) {
    scores.push({ label: 'PNS', score: pns, description: 'Pricing / Needs Score' });
  }

  // Default scores if none found
  if (scores.length === 0) {
    scores.push(
      { label: 'MIA', score: mia >= 0 ? mia : 0, description: 'Made In America Score' },
      { label: 'COORS', score: coors >= 0 ? coors : 0, description: 'Country of Origin Risk Score' },
    );
  }

  return scores;
}

const ProductPreview = ({ data, onConfirm, onDiscard }: ProductPreviewProps) => {
  const { addProduct } = useProducts();
  const [confirmed, setConfirmed] = useState(false);
  const [discarded, setDiscarded] = useState(false);

  const product = buildDrugProduct(data);
  const scores = extractScores(data);
  const flat = flattenAgentData(data);

  const riskLevel = mapRiskLevel(
    extractString(flat, ['riskLevel', 'risk_level', 'risk'], ''),
  );
  const baaEligible = extractBoolean(flat, ['baaEligible', 'baa_eligible'], false);
  const taaCompliant = extractBoolean(flat, ['taaCompliant', 'taa_compliant'], false);
  const recommendation = extractString(flat, ['recommendation', 'procurementRecommendation'], '');
  const concerns = Array.isArray(flat.complianceConcerns) ? (flat.complianceConcerns as string[]) : [];

  const mainScore = scores[0]?.score ?? 0;

  const handleConfirm = () => {
    addProduct(product);
    setConfirmed(true);
    onConfirm();
  };

  const handleDiscard = () => {
    setDiscarded(true);
    onDiscard();
  };

  if (confirmed) {
    return (
      <div data-testid="product-confirmed">
        <Card className="border-green-200 bg-green-50">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-green-800">{product.name} saved</h4>
              <p className="text-sm text-green-700">Product added to your database successfully.</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (discarded) {
    return (
      <div data-testid="product-discarded">
        <Card className="border-navy/10 bg-navy/5">
          <div className="flex items-center gap-3">
            <span className="text-sm text-navy/50">Product discarded.</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div data-testid="product-preview">
    <Card>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <ScoreRing score={mainScore} size={72} />
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-xl font-bold text-navy">
              {product.name}
            </h3>
            {product.genericName && (
              <p className="text-sm text-navy/60">
                Generic: {product.genericName}
              </p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-navy/50">
              {product.ndc !== '0000-0000-00' && (
                <span>NDC: {product.ndc}</span>
              )}
              {product.manufacturer !== 'Unknown' && (
                <>
                  <span aria-hidden="true">&middot;</span>
                  <span>{product.manufacturer}</span>
                </>
              )}
              {product.strength && (
                <>
                  <span aria-hidden="true">&middot;</span>
                  <span>{product.strength}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <BadgeBAA eligible={baaEligible} />
            <BadgeRisk level={riskLevel} />
          </div>
        </div>

        {/* Scores Grid */}
        {scores.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {scores.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center rounded-lg border border-navy/10 p-3"
              >
                <ScoreRing score={s.score} size={48} />
                <span className="mt-1 text-xs font-semibold text-navy">
                  {s.label}
                </span>
                <span className="text-[10px] text-navy/40">
                  {s.description}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Compliance details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg bg-navy/5 p-3">
            <span className="text-xs font-medium uppercase text-navy/40">
              TAA Compliant
            </span>
            <p className="mt-0.5 font-semibold text-navy">
              {taaCompliant ? 'Yes' : 'No'}
            </p>
          </div>
          <div className="rounded-lg bg-navy/5 p-3">
            <span className="text-xs font-medium uppercase text-navy/40">
              Price (WAC)
            </span>
            <p className="mt-0.5 font-semibold text-navy">
              {product.price > 0
                ? `$${product.price.toFixed(2)}`
                : 'Not Available'}
            </p>
          </div>
        </div>

        {/* Recommendation */}
        {recommendation && (
          <div className="rounded-lg border border-gold/30 bg-gold/5 p-3">
            <span className="text-xs font-medium uppercase text-gold">
              Recommendation
            </span>
            <p className="mt-0.5 text-sm text-navy">{recommendation}</p>
          </div>
        )}

        {/* Compliance Concerns */}
        {concerns.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <span className="text-xs font-medium uppercase text-red-600">
              Compliance Concerns
            </span>
            <ul className="mt-1 space-y-1">
              {concerns.map((c, i) => (
                <li key={i} className="text-sm text-red-700">
                  &bull; {String(c)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Raw data fallback for malformed data */}
        {product.name === 'Unknown Drug' && (
          <div className="rounded-lg border border-navy/10 bg-navy/5 p-3">
            <span className="text-xs font-medium uppercase text-navy/40">
              Raw Response
            </span>
            <pre className="mt-1 max-h-40 overflow-auto text-xs text-navy/70">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 border-t border-navy/10 pt-4">
          <Button onClick={handleConfirm} data-testid="confirm-btn">
            Confirm & Save
          </Button>
          <Button
            variant="outline"
            onClick={handleDiscard}
            data-testid="discard-btn"
          >
            Discard
          </Button>
        </div>
      </div>
    </Card>
    </div>
  );
};

export default ProductPreview;
