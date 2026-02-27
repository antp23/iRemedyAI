import { useCallback } from 'react';
import { useProductStore } from '@/store';
import * as scoring from '@/services/scoring';
import type { MIAScore, COORScore, QRScore, PNScore, RiskLevel } from '@/types';

export function useScoring() {
  const products = useProductStore((s) => s.products);

  const calculateMIA = useCallback((): MIAScore => {
    try {
      return scoring.calculateMIA(products);
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
  }, [products]);

  const calculateCOORS = useCallback((): COORScore => {
    try {
      return scoring.calculateCOORS(products);
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
  }, [products]);

  const calculateQRS = useCallback((): QRScore => {
    try {
      return scoring.calculateQRS(products);
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
  }, [products]);

  const calculatePNS = useCallback((): PNScore => {
    try {
      return scoring.calculatePNS(products);
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
  }, [products]);

  const calculateOverallRisk = useCallback((): RiskLevel => {
    try {
      return scoring.calculateOverallRisk(products);
    } catch (err) {
      console.error('Failed to calculate overall risk:', err);
      return 'low';
    }
  }, [products]);

  return {
    calculateMIA,
    calculateCOORS,
    calculateQRS,
    calculatePNS,
    calculateOverallRisk,
  };
}
