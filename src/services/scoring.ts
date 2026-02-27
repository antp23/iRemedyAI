import type {
  DrugProduct,
  MIAScore,
  COORScore,
  QRScore,
  PNScore,
  RiskLevel,
} from '@/types';

export function calculateMIA(products: DrugProduct[]): MIAScore {
  const overallScore = products.length > 0
    ? Math.min(100, products.reduce((sum, p) => sum + (p.interactions?.length ?? 0) * 10, 0))
    : 0;

  return {
    id: crypto.randomUUID(),
    patientId: '',
    sessionId: '',
    overallScore,
    categoryScores: [],
    riskLevel: scoreToRiskLevel(overallScore),
    recommendation: overallScore > 70 ? 'Review medication interactions' : 'No immediate concerns',
    assessedAt: new Date().toISOString(),
  };
}

export function calculateCOORS(products: DrugProduct[]): COORScore {
  const overallScore = products.length > 0 ? 50 : 0;

  return {
    id: crypto.randomUUID(),
    patientId: '',
    sessionId: '',
    overallScore,
    categoryScores: [],
    coordinationLevel: overallScore > 75 ? 'optimal' : overallScore > 50 ? 'adequate' : 'suboptimal',
    gaps: [],
    assessedAt: new Date().toISOString(),
  };
}

export function calculateQRS(products: DrugProduct[]): QRScore {
  const overallScore = products.length > 0 ? 50 : 0;

  return {
    id: crypto.randomUUID(),
    patientId: '',
    sessionId: '',
    overallScore,
    categoryScores: [],
    qualityRating: overallScore > 75 ? 'excellent' : overallScore > 50 ? 'good' : 'fair',
    benchmarkComparison: {
      nationalAverage: 65,
      percentileRank: overallScore,
      trendDirection: 'stable',
    },
    assessedAt: new Date().toISOString(),
  };
}

export function calculatePNS(products: DrugProduct[]): PNScore {
  const overallScore = products.length > 0 ? 50 : 0;

  return {
    id: crypto.randomUUID(),
    patientId: '',
    sessionId: '',
    overallScore,
    categoryScores: [],
    needsLevel: overallScore > 75 ? 'complex' : overallScore > 50 ? 'significant' : 'moderate',
    prioritizedNeeds: [],
    assessedAt: new Date().toISOString(),
  };
}

export function calculateOverallRisk(products: DrugProduct[]): RiskLevel {
  const mia = calculateMIA(products);
  return mia.riskLevel;
}

function scoreToRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 30) return 'moderate';
  return 'low';
}
