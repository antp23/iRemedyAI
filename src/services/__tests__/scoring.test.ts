import { describe, it, expect } from 'vitest';
import {
  calculateMIA,
  calculateCOORS,
  calculateQRS,
  calculatePNS,
  calculateOverallRisk,
  getCountryScore,
  isTAACountry,
  isBAAEligible,
} from '../scoring';
import { generateSeedProducts } from '../seedData';

describe('scoring', () => {
  // --- getCountryScore ---
  describe('getCountryScore', () => {
    it('returns 100 for US', () => {
      expect(getCountryScore('US')).toBe(100);
      expect(getCountryScore('USA')).toBe(100);
      expect(getCountryScore('United States')).toBe(100);
    });

    it('returns 80 for Puerto Rico', () => {
      expect(getCountryScore('PR')).toBe(80);
      expect(getCountryScore('Puerto Rico')).toBe(80);
    });

    it('returns 30 for TAA countries (India, Israel, etc.)', () => {
      expect(getCountryScore('India')).toBe(30);
      expect(getCountryScore('Israel')).toBe(30);
      expect(getCountryScore('Ireland')).toBe(30);
      expect(getCountryScore('Germany')).toBe(30);
      expect(getCountryScore('Japan')).toBe(30);
      expect(getCountryScore('Canada')).toBe(30);
    });

    it('returns 0 for China', () => {
      expect(getCountryScore('China')).toBe(0);
      expect(getCountryScore('CN')).toBe(0);
      expect(getCountryScore('PRC')).toBe(0);
    });

    it('returns 50 for unknown countries', () => {
      expect(getCountryScore('Mars')).toBe(50);
      expect(getCountryScore('Unknown')).toBe(50);
    });

    it('is case-insensitive', () => {
      expect(getCountryScore('us')).toBe(100);
      expect(getCountryScore('CHINA')).toBe(0);
      expect(getCountryScore('india')).toBe(30);
      expect(getCountryScore('puerto rico')).toBe(80);
    });

    it('trims whitespace', () => {
      expect(getCountryScore('  US  ')).toBe(100);
      expect(getCountryScore('  China  ')).toBe(0);
    });
  });

  // --- isTAACountry ---
  describe('isTAACountry', () => {
    it('returns true for US', () => {
      expect(isTAACountry('US')).toBe(true);
    });

    it('returns true for Puerto Rico', () => {
      expect(isTAACountry('Puerto Rico')).toBe(true);
    });

    it('returns true for TAA-designated countries', () => {
      expect(isTAACountry('India')).toBe(true);
      expect(isTAACountry('Germany')).toBe(true);
      expect(isTAACountry('Japan')).toBe(true);
    });

    it('returns false for China', () => {
      expect(isTAACountry('China')).toBe(false);
    });

    it('returns false for unknown countries', () => {
      expect(isTAACountry('Mars')).toBe(false);
    });
  });

  // --- isBAAEligible ---
  describe('isBAAEligible', () => {
    it('returns true when MIA >= 75 AND FG in US', () => {
      expect(isBAAEligible(75, 'US')).toBe(true);
      expect(isBAAEligible(100, 'USA')).toBe(true);
      expect(isBAAEligible(80, 'United States')).toBe(true);
    });

    it('returns false when MIA >= 75 but FG not in US', () => {
      expect(isBAAEligible(100, 'India')).toBe(false);
      expect(isBAAEligible(80, 'China')).toBe(false);
      expect(isBAAEligible(90, 'Puerto Rico')).toBe(false);
    });

    it('returns false when MIA < 75 even with US FG', () => {
      expect(isBAAEligible(74, 'US')).toBe(false);
      expect(isBAAEligible(50, 'USA')).toBe(false);
      expect(isBAAEligible(0, 'US')).toBe(false);
    });

    it('returns false when both conditions fail', () => {
      expect(isBAAEligible(30, 'China')).toBe(false);
    });
  });

  // --- calculateMIA ---
  describe('calculateMIA', () => {
    it('returns score 100 for US/US', () => {
      const result = calculateMIA('US', 'US');
      expect(result.overallScore).toBe(100);
      expect(result.riskLevel).toBe('low');
    });

    it('returns score 80 for PR/PR', () => {
      const result = calculateMIA('Puerto Rico', 'Puerto Rico');
      expect(result.overallScore).toBe(80);
      expect(result.riskLevel).toBe('low');
    });

    it('returns score 0 for China/China', () => {
      const result = calculateMIA('China', 'China');
      expect(result.overallScore).toBe(0);
      expect(result.riskLevel).toBe('critical');
    });

    it('returns score 30 for India/India (TAA)', () => {
      const result = calculateMIA('India', 'India');
      expect(result.overallScore).toBe(30);
      expect(result.riskLevel).toBe('high');
    });

    it('calculates weighted score for mixed origins (API: India, FG: US)', () => {
      // India=30, US=100 => 30*0.6 + 100*0.4 = 18 + 40 = 58
      const result = calculateMIA('India', 'US');
      expect(result.overallScore).toBe(58);
      // 58 < 60 threshold, so it's 'high' risk
      expect(result.riskLevel).toBe('high');
    });

    it('calculates weighted score for mixed origins (API: China, FG: US)', () => {
      // China=0, US=100 => 0*0.6 + 100*0.4 = 40
      const result = calculateMIA('China', 'US');
      expect(result.overallScore).toBe(40);
      expect(result.riskLevel).toBe('high');
    });

    it('calculates weighted score for API: US, FG: China', () => {
      // US=100, China=0 => 100*0.6 + 0*0.4 = 60
      const result = calculateMIA('US', 'China');
      expect(result.overallScore).toBe(60);
      expect(result.riskLevel).toBe('moderate');
    });

    it('populates all MIAScore fields', () => {
      const result = calculateMIA('US', 'US');
      expect(result.id).toBeTruthy();
      expect(result.categoryScores).toHaveLength(5);
      expect(result.recommendation).toBeTruthy();
      expect(result.assessedAt).toBeTruthy();
    });

    it('marks BAA eligibility in category scores', () => {
      const eligible = calculateMIA('US', 'US');
      const baaCategory = eligible.categoryScores.find(c => c.findings.some(f => f.includes('BAA')));
      expect(baaCategory?.findings[0]).toContain('BAA eligible');

      const notEligible = calculateMIA('China', 'China');
      const baaNotEligible = notEligible.categoryScores.find(c => c.findings.some(f => f.includes('BAA')));
      expect(baaNotEligible?.findings[0]).toContain('Not BAA eligible');
    });
  });

  // --- calculateCOORS ---
  describe('calculateCOORS', () => {
    const products = generateSeedProducts();

    it('returns higher scores for US-manufactured products', () => {
      const usProduct = products.find(p => p.id === 'seed-001')!;
      const result = calculateCOORS(usProduct);
      expect(result.overallScore).toBeGreaterThanOrEqual(70);
      expect(result.coordinationLevel).toMatch(/optimal|adequate/);
    });

    it('returns lower scores for China-manufactured products', () => {
      const cnProduct = products.find(p => p.id === 'seed-021')!;
      const result = calculateCOORS(cnProduct);
      expect(result.overallScore).toBeLessThan(70);
      expect(result.gaps.length).toBeGreaterThan(0);
    });

    it('identifies supply chain risk gaps', () => {
      const cnProduct = products.find(p => p.id === 'seed-021')!;
      const result = calculateCOORS(cnProduct);
      const supplyChainGap = result.gaps.find(g => g.type === 'supply-chain-risk');
      expect(supplyChainGap).toBeDefined();
      expect(supplyChainGap?.severity).toMatch(/critical|high/);
    });

    it('populates all COORScore fields', () => {
      const product = products[0];
      const result = calculateCOORS(product);
      expect(result.id).toBeTruthy();
      expect(result.categoryScores).toHaveLength(5);
      expect(result.coordinationLevel).toBeTruthy();
      expect(result.assessedAt).toBeTruthy();
    });
  });

  // --- calculateQRS ---
  describe('calculateQRS', () => {
    const products = generateSeedProducts();

    it('gives higher scores to products with fewer warnings', () => {
      const simpleProduct = products.find(p => p.warnings.length <= 1)!;
      const complexProduct = products.find(p => p.warnings.length >= 3)!;
      const simpleScore = calculateQRS(simpleProduct);
      const complexScore = calculateQRS(complexProduct);
      expect(simpleScore.overallScore).toBeGreaterThan(complexScore.overallScore);
    });

    it('populates benchmark comparison', () => {
      const result = calculateQRS(products[0]);
      expect(result.benchmarkComparison.nationalAverage).toBe(72);
      expect(result.benchmarkComparison.percentileRank).toBeGreaterThan(0);
      expect(result.benchmarkComparison.trendDirection).toMatch(/improving|stable|declining/);
    });

    it('assigns quality rating based on score', () => {
      const result = calculateQRS(products[0]);
      expect(['excellent', 'good', 'fair', 'poor']).toContain(result.qualityRating);
    });

    it('populates all QRScore fields', () => {
      const result = calculateQRS(products[0]);
      expect(result.id).toBeTruthy();
      expect(result.categoryScores).toHaveLength(5);
      expect(result.qualityRating).toBeTruthy();
      expect(result.assessedAt).toBeTruthy();
    });
  });

  // --- calculatePNS ---
  describe('calculatePNS', () => {
    const products = generateSeedProducts();

    it('gives higher scores to cheaper products', () => {
      const cheapProduct = products.find(p => p.price < 10)!;
      const expensiveProduct = products.find(p => p.price > 200)!;
      const cheapScore = calculatePNS(cheapProduct);
      const expensiveScore = calculatePNS(expensiveProduct);
      expect(cheapScore.overallScore).toBeGreaterThan(expensiveScore.overallScore);
    });

    it('flags unavailable products as prioritized needs', () => {
      const unavailable = products.find(p => !p.isAvailable)!;
      const result = calculatePNS(unavailable);
      expect(result.prioritizedNeeds.length).toBeGreaterThan(0);
      const urgentNeed = result.prioritizedNeeds.find(n => n.urgency === 'immediate');
      expect(urgentNeed).toBeDefined();
    });

    it('populates all PNScore fields', () => {
      const result = calculatePNS(products[0]);
      expect(result.id).toBeTruthy();
      expect(result.categoryScores).toHaveLength(5);
      expect(result.needsLevel).toBeTruthy();
      expect(result.assessedAt).toBeTruthy();
    });
  });

  // --- calculateOverallRisk ---
  describe('calculateOverallRisk', () => {
    it('returns low risk for high-scoring US product', () => {
      const mia = calculateMIA('US', 'US');
      const products = generateSeedProducts();
      const usProduct = products.find(p => p.id === 'seed-001')!;
      const coors = calculateCOORS(usProduct);
      const qrs = calculateQRS(usProduct);
      const risk = calculateOverallRisk(mia, coors, qrs);
      expect(risk).toBe('low');
    });

    it('returns critical risk for China-sourced product with issues', () => {
      const mia = calculateMIA('China', 'China');
      const products = generateSeedProducts();
      const cnProduct = products.find(p => p.id === 'seed-021')!;
      const coors = calculateCOORS(cnProduct);
      const qrs = calculateQRS(cnProduct);
      const risk = calculateOverallRisk(mia, coors, qrs);
      expect(['high', 'critical']).toContain(risk);
    });

    it('returns moderate risk for TAA-country product', () => {
      const mia = calculateMIA('India', 'India');
      const products = generateSeedProducts();
      const indiaProduct = products.find(p => p.id === 'seed-014')!;
      const coors = calculateCOORS(indiaProduct);
      const qrs = calculateQRS(indiaProduct);
      const risk = calculateOverallRisk(mia, coors, qrs);
      expect(['moderate', 'high']).toContain(risk);
    });
  });
});
