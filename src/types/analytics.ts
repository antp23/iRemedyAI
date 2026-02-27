export interface AnalyticsDashboard {
  patientId: string;
  period: AnalyticsPeriod;
  healthTrends: HealthTrend[];
  appointmentStats: AppointmentStats;
  medicationAdherence: MedicationAdherence;
  scoringTrends: ScoringTrends;
  generatedAt: string;
}

export type AnalyticsPeriod = '7d' | '30d' | '90d' | '6m' | '1y';

export interface HealthTrend {
  metric: string;
  dataPoints: DataPoint[];
  trend: TrendDirection;
  changePercent: number;
}

export interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

export type TrendDirection = 'improving' | 'stable' | 'declining';

export interface AppointmentStats {
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
  upcoming: number;
  completionRate: number;
}

export interface MedicationAdherence {
  overallRate: number;
  medications: MedicationAdherenceDetail[];
}

export interface MedicationAdherenceDetail {
  medicationName: string;
  adherenceRate: number;
  missedDoses: number;
  totalDoses: number;
  lastTaken?: string;
}

export interface ScoringTrends {
  mia: ScoreTrend;
  coor: ScoreTrend;
  qr: ScoreTrend;
  pn: ScoreTrend;
  composite: ScoreTrend;
}

export interface ScoreTrend {
  current: number;
  previous: number;
  changePercent: number;
  trend: TrendDirection;
  history: DataPoint[];
}

export interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: string;
  eventCategory: EventCategory;
  properties: Record<string, unknown>;
  timestamp: string;
}

export type EventCategory =
  | 'navigation'
  | 'interaction'
  | 'appointment'
  | 'medication'
  | 'chat'
  | 'scoring'
  | 'error';
