export interface Symptom {
  id: string;
  name: string;
  bodyArea: BodyArea;
  severity: SymptomSeverity;
  duration?: string;
  description?: string;
}

export type BodyArea =
  | 'head'
  | 'chest'
  | 'abdomen'
  | 'back'
  | 'limbs'
  | 'skin'
  | 'general';

export type SymptomSeverity = 'mild' | 'moderate' | 'severe' | 'critical';

export interface SymptomCheckSession {
  id: string;
  userId: string;
  symptoms: Symptom[];
  responses: SymptomResponse[];
  assessment?: SymptomAssessment;
  createdAt: string;
  completedAt?: string;
}

export interface SymptomResponse {
  questionId: string;
  question: string;
  answer: string;
  timestamp: string;
}

export interface SymptomAssessment {
  possibleConditions: PossibleCondition[];
  urgencyLevel: UrgencyLevel;
  recommendation: string;
  disclaimer: string;
}

export interface PossibleCondition {
  name: string;
  probability: number;
  description: string;
}

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';
