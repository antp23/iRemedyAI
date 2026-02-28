import type {
  MIAScore,
  MIACategoryScore,
  MIACategory,
  COORScore,
  COORCategoryScore,
  COORCategory,
  CoordinationLevel,
  CareGap,
  QRScore,
  QRCategoryScore,
  QRCategory,
  QualityRating,
  PNScore,
  PNCategoryScore,
  PNCategory,
  PatientNeedsLevel,
  RiskLevel,
  DrugProduct,
} from '@/types';

// --- Country scoring constants ---

const US_SCORE = 100;
const PR_SCORE = 80;
const TAA_SCORE = 30;
const CHINA_SCORE = 0;
const DEFAULT_COUNTRY_SCORE = 50;

const TAA_COUNTRIES = new Set([
  'aruba', 'australia', 'austria', 'belgium', 'belize', 'benin',
  'bhutan', 'botswana', 'brunei', 'bulgaria', 'burkina faso',
  'burundi', 'cameroon', 'canada', 'central african republic',
  'chad', 'chile', 'colombia', 'comoros', 'congo', 'costa rica',
  'croatia', 'cyprus', 'czech republic', 'czechia', 'denmark',
  'djibouti', 'dominica', 'dominican republic', 'ecuador', 'egypt',
  'el salvador', 'estonia', 'eswatini', 'ethiopia', 'fiji',
  'finland', 'france', 'gambia', 'germany', 'ghana', 'greece',
  'grenada', 'guatemala', 'guinea', 'guinea-bissau', 'guyana',
  'haiti', 'honduras', 'hong kong', 'hungary', 'iceland', 'india',
  'ireland', 'israel', 'italy', 'jamaica', 'japan', 'jordan',
  'kenya', 'kiribati', 'korea', 'south korea', 'kosovo', 'kuwait',
  'latvia', 'lebanon', 'lesotho', 'liechtenstein', 'lithuania',
  'luxembourg', 'madagascar', 'malawi', 'mali', 'malta',
  'mauritania', 'mauritius', 'mexico', 'moldova', 'mongolia',
  'montenegro', 'morocco', 'mozambique', 'namibia', 'nepal',
  'netherlands', 'new zealand', 'nicaragua', 'niger', 'nigeria',
  'north macedonia', 'norway', 'oman', 'pakistan', 'panama',
  'papua new guinea', 'paraguay', 'peru', 'philippines', 'poland',
  'portugal', 'romania', 'rwanda', 'saint lucia',
  'saint vincent and the grenadines', 'samoa', 'sao tome and principe',
  'senegal', 'serbia', 'sierra leone', 'singapore', 'slovakia',
  'slovenia', 'solomon islands', 'somalia', 'south africa', 'spain',
  'sri lanka', 'suriname', 'sweden', 'switzerland', 'taiwan',
  'tanzania', 'thailand', 'togo', 'tonga', 'trinidad and tobago',
  'tunisia', 'turkey', 'tuvalu', 'uganda', 'ukraine',
  'united kingdom', 'uk', 'uruguay', 'vanuatu', 'west bank',
  'western sahara', 'zambia', 'zimbabwe',
]);

const CHINA_ALIASES = new Set([
  'china', 'cn', 'prc', "people's republic of china",
  'peoples republic of china',
]);

const US_ALIASES = new Set([
  'us', 'usa', 'united states', 'united states of america',
]);

const PR_ALIASES = new Set([
  'pr', 'puerto rico',
]);

/**
 * Get the numeric country score for a given country name/code.
 */
export function getCountryScore(country: string): number {
  const normalized = country.trim().toLowerCase();
  if (!normalized) return DEFAULT_COUNTRY_SCORE;

  if (US_ALIASES.has(normalized)) return US_SCORE;
  if (PR_ALIASES.has(normalized)) return PR_SCORE;
  if (CHINA_ALIASES.has(normalized)) return CHINA_SCORE;
  if (TAA_COUNTRIES.has(normalized)) return TAA_SCORE;

  return DEFAULT_COUNTRY_SCORE;
}

/**
 * Determine if a country is TAA-designated.
 */
export function isTAACountry(country: string): boolean {
  const normalized = country.trim().toLowerCase();
  return TAA_COUNTRIES.has(normalized) || US_ALIASES.has(normalized) || PR_ALIASES.has(normalized);
}

/**
 * Check BAA (Buy American Act) eligibility.
 * Requires MIA score >= 75 AND finished good manufactured in US.
 */
export function isBAAEligible(miaOverallScore: number, fgCountry: string): boolean {
  const normalized = fgCountry.trim().toLowerCase();
  return miaOverallScore >= 75 && US_ALIASES.has(normalized);
}

function scoreToRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'low';
  if (score >= 60) return 'moderate';
  if (score >= 30) return 'high';
  return 'critical';
}

function generateId(prefix: string, ...parts: string[]): string {
  const hash = parts.join('-').split('').reduce((acc, ch) => {
    return ((acc << 5) - acc + ch.charCodeAt(0)) | 0;
  }, 0);
  return `${prefix}-${Math.abs(hash).toString(36)}`;
}

// --- MIA Score (Made In America) ---

/**
 * Calculate MIA (Made In America) score based on API and FG country origins.
 * API country is weighted 60%, FG country is weighted 40%.
 */
export function calculateMIA(apiCountry: string, fgCountry: string): MIAScore {
  const apiScore = getCountryScore(apiCountry);
  const fgScore = getCountryScore(fgCountry);
  const overallScore = Math.round(apiScore * 0.6 + fgScore * 0.4);
  const baaEligible = isBAAEligible(overallScore, fgCountry);

  const categoryScores: MIACategoryScore[] = [
    {
      category: 'medication-adherence' as MIACategory,
      score: apiScore,
      maxScore: 100,
      weight: 0.6,
      findings: [`API sourced from ${apiCountry} (score: ${apiScore})`],
    },
    {
      category: 'interaction-risk' as MIACategory,
      score: fgScore,
      maxScore: 100,
      weight: 0.4,
      findings: [`Finished good from ${fgCountry} (score: ${fgScore})`],
    },
    {
      category: 'allergy-sensitivity' as MIACategory,
      score: baaEligible ? 100 : 0,
      maxScore: 100,
      weight: 0,
      findings: [baaEligible ? 'BAA eligible' : 'Not BAA eligible'],
    },
    {
      category: 'dosage-appropriateness' as MIACategory,
      score: isTAACountry(apiCountry) ? 100 : 0,
      maxScore: 100,
      weight: 0,
      findings: [isTAACountry(apiCountry) ? 'API country is TAA designated' : 'API country is NOT TAA designated'],
    },
    {
      category: 'therapeutic-duplication' as MIACategory,
      score: isTAACountry(fgCountry) ? 100 : 0,
      maxScore: 100,
      weight: 0,
      findings: [isTAACountry(fgCountry) ? 'FG country is TAA designated' : 'FG country is NOT TAA designated'],
    },
  ];

  let recommendation: string;
  if (overallScore >= 80) {
    recommendation = 'Product has strong domestic sourcing. Preferred for government procurement.';
  } else if (overallScore >= 60) {
    recommendation = 'Product has moderate domestic content. May qualify under TAA provisions.';
  } else if (overallScore >= 30) {
    recommendation = 'Product has limited domestic sourcing. Review TAA compliance carefully.';
  } else {
    recommendation = 'Product is primarily foreign-sourced. Not recommended for BAA/TAA procurement.';
  }

  return {
    id: generateId('mia', apiCountry, fgCountry),
    patientId: '',
    sessionId: '',
    overallScore,
    categoryScores,
    riskLevel: scoreToRiskLevel(overallScore),
    recommendation,
    assessedAt: new Date().toISOString(),
  };
}

// --- COORS (Country of Origin Risk Score) ---

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

function coordinationLevelFromScore(score: number): CoordinationLevel {
  if (score >= 80) return 'optimal';
  if (score >= 60) return 'adequate';
  if (score >= 30) return 'suboptimal';
  return 'fragmented';
}

/**
 * Calculate COORS (Country of Origin Risk Score) for a drug product.
 * Evaluates supply chain risk based on manufacturer origin and product attributes.
 */
export function calculateCOORS(product: DrugProduct): COORScore {
  const country = extractCountryFromManufacturer(product.manufacturer);
  const countryScore = getCountryScore(country);

  const supplyChainScore = countryScore;
  const regulatoryScore = product.fdaApprovalDate ? 85 : 40;
  const documentationScore = product.ndc && product.labelerName ? 90 : 50;
  const trackingScore = product.lotNumber && product.barcode ? 95 : 45;
  const qualitySystemScore = isTAACountry(country) ? 80 : 35;

  const categoryScores: COORCategoryScore[] = [
    {
      category: 'care-continuity' as COORCategory,
      score: supplyChainScore,
      maxScore: 100,
      weight: 0.30,
      findings: [`Manufacturer origin: ${country} (score: ${supplyChainScore})`],
    },
    {
      category: 'provider-communication' as COORCategory,
      score: regulatoryScore,
      maxScore: 100,
      weight: 0.25,
      findings: [product.fdaApprovalDate ? `FDA approved: ${product.fdaApprovalDate}` : 'No FDA approval date on record'],
    },
    {
      category: 'referral-completion' as COORCategory,
      score: documentationScore,
      maxScore: 100,
      weight: 0.20,
      findings: [`NDC: ${product.ndc || 'missing'}, Labeler: ${product.labelerName || 'missing'}`],
    },
    {
      category: 'follow-up-adherence' as COORCategory,
      score: trackingScore,
      maxScore: 100,
      weight: 0.15,
      findings: [`Lot: ${product.lotNumber || 'N/A'}, Barcode: ${product.barcode || 'N/A'}`],
    },
    {
      category: 'information-transfer' as COORCategory,
      score: qualitySystemScore,
      maxScore: 100,
      weight: 0.10,
      findings: [isTAACountry(country) ? 'TAA-designated country of origin' : 'Non-TAA country of origin'],
    },
  ];

  const overallScore = Math.round(
    supplyChainScore * 0.30 +
    regulatoryScore * 0.25 +
    documentationScore * 0.20 +
    trackingScore * 0.15 +
    qualitySystemScore * 0.10
  );

  const gaps: CareGap[] = [];
  if (countryScore < 50) {
    gaps.push({
      type: 'supply-chain-risk',
      description: `Product manufactured in ${country} which has elevated supply chain risk`,
      severity: countryScore === 0 ? 'critical' : 'high',
      recommendedAction: 'Evaluate alternative domestic or TAA-compliant suppliers',
    });
  }
  if (!product.fdaApprovalDate) {
    gaps.push({
      type: 'regulatory-gap',
      description: 'No FDA approval date documented',
      severity: 'medium',
      recommendedAction: 'Verify FDA approval status and document approval date',
    });
  }
  if (!product.lotNumber) {
    gaps.push({
      type: 'traceability-gap',
      description: 'Missing lot number for product traceability',
      severity: 'medium',
      recommendedAction: 'Obtain lot number from manufacturer for supply chain tracking',
    });
  }

  return {
    id: generateId('coors', product.id),
    patientId: '',
    sessionId: '',
    overallScore,
    categoryScores,
    coordinationLevel: coordinationLevelFromScore(overallScore),
    gaps,
    assessedAt: new Date().toISOString(),
  };
}

// --- QRS (Quality Rating Score) ---

function qualityRatingFromScore(score: number): QualityRating {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}

/**
 * Calculate QRS (Quality Rating Score) for a drug product.
 * Evaluates product quality based on safety profile, ingredients, and regulatory status.
 */
export function calculateQRS(product: DrugProduct): QRScore {
  const ingredientScore = product.activeIngredients.length > 0 ? 90 : 30;
  const safetyScore = Math.max(0, 100 - product.warnings.length * 10 - product.contraindications.length * 15);
  const satisfactionScore = product.isAvailable ? 80 : 40;
  const outcomeScore = product.interactions.length === 0 ? 95 :
    Math.max(0, 100 - product.interactions.filter(i => i.severity === 'major' || i.severity === 'contraindicated').length * 25);
  const evidenceScore = product.fdaApprovalDate ? 90 : 45;

  const categoryScores: QRCategoryScore[] = [
    {
      category: 'treatment-effectiveness' as QRCategory,
      score: ingredientScore,
      maxScore: 100,
      weight: 0.25,
      findings: [`${product.activeIngredients.length} active ingredient(s) documented`],
    },
    {
      category: 'safety-profile' as QRCategory,
      score: safetyScore,
      maxScore: 100,
      weight: 0.25,
      findings: [`${product.warnings.length} warning(s), ${product.contraindications.length} contraindication(s)`],
    },
    {
      category: 'patient-satisfaction' as QRCategory,
      score: satisfactionScore,
      maxScore: 100,
      weight: 0.15,
      findings: [product.isAvailable ? 'Product currently available' : 'Product currently unavailable'],
    },
    {
      category: 'outcome-measures' as QRCategory,
      score: outcomeScore,
      maxScore: 100,
      weight: 0.20,
      findings: [`${product.interactions.length} known interaction(s)`],
    },
    {
      category: 'evidence-alignment' as QRCategory,
      score: evidenceScore,
      maxScore: 100,
      weight: 0.15,
      findings: [product.fdaApprovalDate ? `FDA approved ${product.fdaApprovalDate}` : 'No FDA approval date'],
    },
  ];

  const overallScore = Math.round(
    ingredientScore * 0.25 +
    safetyScore * 0.25 +
    satisfactionScore * 0.15 +
    outcomeScore * 0.20 +
    evidenceScore * 0.15
  );

  return {
    id: generateId('qrs', product.id),
    patientId: '',
    sessionId: '',
    overallScore,
    categoryScores,
    qualityRating: qualityRatingFromScore(overallScore),
    benchmarkComparison: {
      nationalAverage: 72,
      percentileRank: Math.min(99, Math.round(overallScore * 1.1)),
      trendDirection: overallScore >= 72 ? 'improving' : overallScore >= 50 ? 'stable' : 'declining',
    },
    assessedAt: new Date().toISOString(),
  };
}

// --- PNS (Pricing/Need Score) ---

function needsLevelFromScore(score: number): PatientNeedsLevel {
  if (score >= 80) return 'minimal';
  if (score >= 60) return 'moderate';
  if (score >= 30) return 'significant';
  return 'complex';
}

/**
 * Calculate PNS (Pricing & Need Score) for a drug product.
 * Evaluates cost-effectiveness, availability, and procurement considerations.
 */
export function calculatePNS(product: DrugProduct): PNScore {
  const priceScore = product.price <= 10 ? 95 :
    product.price <= 50 ? 80 :
    product.price <= 200 ? 60 :
    product.price <= 1000 ? 40 : 20;

  const accessScore = product.isAvailable ? (product.requiresPrescription ? 60 : 85) : 25;
  const formularyScore = product.category !== 'other' ? 75 : 50;
  const costBarrierScore = product.price <= 100 ? 90 : product.price <= 500 ? 60 : 30;
  const literacyScore = product.description.length > 20 ? 80 : 40;

  const categoryScores: PNCategoryScore[] = [
    {
      category: 'physical-health' as PNCategory,
      score: priceScore,
      maxScore: 100,
      weight: 0.30,
      findings: [`Unit price: $${product.price.toFixed(2)} ${product.currency}`],
    },
    {
      category: 'mental-health' as PNCategory,
      score: accessScore,
      maxScore: 100,
      weight: 0.20,
      findings: [
        product.isAvailable ? 'Product in stock' : 'Product out of stock',
        product.requiresPrescription ? 'Prescription required' : 'Over the counter',
      ],
    },
    {
      category: 'social-determinants' as PNCategory,
      score: formularyScore,
      maxScore: 100,
      weight: 0.15,
      findings: [`Therapeutic category: ${product.category}`],
    },
    {
      category: 'financial-barriers' as PNCategory,
      score: costBarrierScore,
      maxScore: 100,
      weight: 0.25,
      findings: [costBarrierScore >= 60 ? 'Acceptable cost threshold' : 'High cost may limit access'],
    },
    {
      category: 'health-literacy' as PNCategory,
      score: literacyScore,
      maxScore: 100,
      weight: 0.10,
      findings: [product.description.length > 20 ? 'Adequate product documentation' : 'Limited product documentation'],
    },
  ];

  const overallScore = Math.round(
    priceScore * 0.30 +
    accessScore * 0.20 +
    formularyScore * 0.15 +
    costBarrierScore * 0.25 +
    literacyScore * 0.10
  );

  return {
    id: generateId('pns', product.id),
    patientId: '',
    sessionId: '',
    overallScore,
    categoryScores,
    needsLevel: needsLevelFromScore(overallScore),
    prioritizedNeeds: buildPrioritizedNeeds(product, priceScore, accessScore),
    assessedAt: new Date().toISOString(),
  };
}

function buildPrioritizedNeeds(
  product: DrugProduct,
  priceScore: number,
  accessScore: number,
): PNScore['prioritizedNeeds'] {
  const needs: PNScore['prioritizedNeeds'] = [];
  let rank = 1;

  if (priceScore < 50) {
    needs.push({
      rank: rank++,
      category: 'financial-barriers' as PNCategory,
      description: `High unit cost ($${product.price.toFixed(2)}) may limit procurement`,
      urgency: priceScore < 30 ? 'urgent' : 'soon',
      suggestedInterventions: ['Evaluate generic alternatives', 'Negotiate volume pricing', 'Review GPO contracts'],
    });
  }

  if (accessScore < 50) {
    needs.push({
      rank: rank++,
      category: 'physical-health' as PNCategory,
      description: 'Product availability is limited',
      urgency: 'urgent',
      suggestedInterventions: ['Identify backup suppliers', 'Establish safety stock levels'],
    });
  }

  if (!product.isAvailable) {
    needs.push({
      rank: rank++,
      category: 'social-determinants' as PNCategory,
      description: 'Product currently unavailable for procurement',
      urgency: 'immediate',
      suggestedInterventions: ['Source therapeutic equivalent', 'Contact manufacturer for restock timeline'],
    });
  }

  return needs;
}

// --- Overall Risk ---

/**
 * Calculate overall risk level from MIA, COORS, and QRS scores.
 * MIA weighted 50%, COORS 30%, QRS 20%.
 */
export function calculateOverallRisk(mia: MIAScore, coors: COORScore, qrs: QRScore): RiskLevel {
  const composite = Math.round(
    mia.overallScore * 0.50 +
    coors.overallScore * 0.30 +
    qrs.overallScore * 0.20
  );
  return scoreToRiskLevel(composite);
}
