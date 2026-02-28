import { useCallback } from 'react';
import { useProductStore } from '@/store';
import * as scoring from '@/services/scoring';
import type { DrugProduct, MIAScore, COORScore, QRScore, PNScore, RiskLevel } from '@/types';

export function useScoring() {
  const products = useProductStore((s) => s.products);

  const calculateMIA = useCallback(
    (apiCountry: string, fgCountry: string): MIAScore => {
      try {
        return scoring.calculateMIA(apiCountry, fgCountry);
      } catch (err) {
        console.error('Failed to calculate MIA score:', err);
        return {
          id: '',
          patientId: '',
          sessionId: '',
          overallScore: 0,
          categoryScores: [],
          riskLevel: 'low',
          recommendation: '',
          assessedAt: new Date().toISOString(),
        };
      }
    },
    [],
  );

  const calculateCOORS = useCallback(
    (product: DrugProduct): COORScore => {
      try {
        return scoring.calculateCOORS(product);
      } catch (err) {
        console.error('Failed to calculate COORS score:', err);
        return {
          id: '',
          patientId: '',
          sessionId: '',
          overallScore: 0,
          categoryScores: [],
          coordinationLevel: 'fragmented',
          gaps: [],
          assessedAt: new Date().toISOString(),
        };
      }
    },
    [],
  );

  const calculateQRS = useCallback(
    (product: DrugProduct): QRScore => {
      try {
        return scoring.calculateQRS(product);
      } catch (err) {
        console.error('Failed to calculate QRS score:', err);
        return {
          id: '',
          patientId: '',
          sessionId: '',
          overallScore: 0,
          categoryScores: [],
          qualityRating: 'poor',
          benchmarkComparison: {
            nationalAverage: 0,
            percentileRank: 0,
            trendDirection: 'stable',
          },
          assessedAt: new Date().toISOString(),
        };
      }
    },
    [],
  );

  const calculatePNS = useCallback(
    (product: DrugProduct): PNScore => {
      try {
        return scoring.calculatePNS(product);
      } catch (err) {
        console.error('Failed to calculate PNS score:', err);
        return {
          id: '',
          patientId: '',
          sessionId: '',
          overallScore: 0,
          categoryScores: [],
          needsLevel: 'minimal',
          prioritizedNeeds: [],
          assessedAt: new Date().toISOString(),
        };
      }
    },
    [],
  );

  const calculateOverallRisk = useCallback(
    (mia: MIAScore, coors: COORScore, qrs: QRScore): RiskLevel => {
      try {
        return scoring.calculateOverallRisk(mia, coors, qrs);
      } catch (err) {
        console.error('Failed to calculate overall risk:', err);
        return 'low';
      }
    },
    [],
  );

  return {
    products,
    calculateMIA,
    calculateCOORS,
    calculateQRS,
    calculatePNS,
    calculateOverallRisk,
  };
}
