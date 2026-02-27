export interface MIAScore {
  id: string;
  patientId: string;
  sessionId: string;
  overallScore: number;
  categoryScores: MIACategoryScore[];
  riskLevel: RiskLevel;
  recommendation: string;
  assessedAt: string;
}

export interface MIACategoryScore {
  category: MIACategory;
  score: number;
  maxScore: number;
  weight: number;
  findings: string[];
}

export type MIACategory =
  | 'medication-adherence'
  | 'interaction-risk'
  | 'allergy-sensitivity'
  | 'dosage-appropriateness'
  | 'therapeutic-duplication';

export interface COORScore {
  id: string;
  patientId: string;
  sessionId: string;
  overallScore: number;
  categoryScores: COORCategoryScore[];
  coordinationLevel: CoordinationLevel;
  gaps: CareGap[];
  assessedAt: string;
}

export interface COORCategoryScore {
  category: COORCategory;
  score: number;
  maxScore: number;
  weight: number;
  findings: string[];
}

export type COORCategory =
  | 'care-continuity'
  | 'provider-communication'
  | 'referral-completion'
  | 'follow-up-adherence'
  | 'information-transfer';

export type CoordinationLevel = 'optimal' | 'adequate' | 'suboptimal' | 'fragmented';

export interface CareGap {
  type: string;
  description: string;
  severity: GapSeverity;
  recommendedAction: string;
}

export type GapSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface QRScore {
  id: string;
  patientId: string;
  sessionId: string;
  overallScore: number;
  categoryScores: QRCategoryScore[];
  qualityRating: QualityRating;
  benchmarkComparison: BenchmarkComparison;
  assessedAt: string;
}

export interface QRCategoryScore {
  category: QRCategory;
  score: number;
  maxScore: number;
  weight: number;
  findings: string[];
}

export type QRCategory =
  | 'treatment-effectiveness'
  | 'safety-profile'
  | 'patient-satisfaction'
  | 'outcome-measures'
  | 'evidence-alignment';

export type QualityRating = 'excellent' | 'good' | 'fair' | 'poor';

export interface BenchmarkComparison {
  nationalAverage: number;
  percentileRank: number;
  trendDirection: 'improving' | 'stable' | 'declining';
}

export interface PNScore {
  id: string;
  patientId: string;
  sessionId: string;
  overallScore: number;
  categoryScores: PNCategoryScore[];
  needsLevel: PatientNeedsLevel;
  prioritizedNeeds: PrioritizedNeed[];
  assessedAt: string;
}

export interface PNCategoryScore {
  category: PNCategory;
  score: number;
  maxScore: number;
  weight: number;
  findings: string[];
}

export type PNCategory =
  | 'physical-health'
  | 'mental-health'
  | 'social-determinants'
  | 'financial-barriers'
  | 'health-literacy';

export type PatientNeedsLevel = 'minimal' | 'moderate' | 'significant' | 'complex';

export interface PrioritizedNeed {
  rank: number;
  category: PNCategory;
  description: string;
  urgency: 'routine' | 'soon' | 'urgent' | 'immediate';
  suggestedInterventions: string[];
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface ScoringSession {
  id: string;
  patientId: string;
  miaScore?: MIAScore;
  coorScore?: COORScore;
  qrScore?: QRScore;
  pnScore?: PNScore;
  compositeScore: number;
  createdAt: string;
  completedAt?: string;
}
