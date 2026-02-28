import { describe, it, expect } from 'vitest';
import type { DrugProduct } from '@/types';
import {
  computeProductRiskScore,
  getTopRiskProducts,
  findBAAGaps,
  computeAggregateMetrics,
  scheduleToRiskLevel,
} from '../RiskAnalyzer';

function makeProduct(overrides: Partial<DrugProduct> = {}): DrugProduct {
  return {
    id: crypto.randomUUID(),
    ndc: '0000-0000-00',
    name: 'Test Drug',
    brandName: 'TestBrand',
    genericName: 'testgeneric',
    labelerName: 'TestLab',
    manufacturer: 'TestMfg',
    productType: 'prescription',
    category: 'analgesic',
    schedule: 'unscheduled',
    routeOfAdministration: 'oral',
    dosageForm: 'tablet',
    strength: '100',
    strengthUnit: 'mg',
    packageSize: '30',
    packageType: 'bottle',
    description: 'A test drug product',
    activeIngredients: [],
    inactiveIngredients: [],
    indications: [],
    contraindications: [],
    warnings: [],
    sideEffects: [],
    interactions: [],
    storageConditions: 'Room temperature',
    requiresPrescription: true,
    isControlled: false,
    isAvailable: true,
    price: 10,
    currency: 'USD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('scheduleToRiskLevel', () => {
  it('maps schedule I to critical', () => {
    expect(scheduleToRiskLevel('I')).toBe('critical');
  });

  it('maps schedule II to critical', () => {
    expect(scheduleToRiskLevel('II')).toBe('critical');
  });

  it('maps schedule III to high', () => {
    expect(scheduleToRiskLevel('III')).toBe('high');
  });

  it('maps schedule IV to moderate', () => {
    expect(scheduleToRiskLevel('IV')).toBe('moderate');
  });

  it('maps schedule V to low', () => {
    expect(scheduleToRiskLevel('V')).toBe('low');
  });

  it('maps unscheduled to low', () => {
    expect(scheduleToRiskLevel('unscheduled')).toBe('low');
  });
});

describe('computeProductRiskScore', () => {
  it('returns a low score for an unscheduled product with no interactions', () => {
    const product = makeProduct({ schedule: 'unscheduled', isControlled: false });
    const score = computeProductRiskScore(product);
    expect(score).toBe(15); // low (1) * 15 = 15
  });

  it('returns a high score for a schedule I controlled product', () => {
    const product = makeProduct({ schedule: 'I', isControlled: true });
    const score = computeProductRiskScore(product);
    // critical (4) * 15 = 60, controlled penalty = 10 => 70
    expect(score).toBe(70);
  });

  it('factors in interaction severity', () => {
    const product = makeProduct({
      schedule: 'unscheduled',
      interactions: [
        { drugName: 'A', severity: 'major', description: '' },
        { drugName: 'B', severity: 'minor', description: '' },
      ],
    });
    const score = computeProductRiskScore(product);
    // schedule: low(1)*15 = 15, interactions: (3+1)*5 = 20, controlled: 0 => 35
    expect(score).toBe(35);
  });

  it('caps interaction contribution at 40', () => {
    const product = makeProduct({
      schedule: 'unscheduled',
      interactions: [
        { drugName: 'A', severity: 'contraindicated', description: '' },
        { drugName: 'B', severity: 'contraindicated', description: '' },
        { drugName: 'C', severity: 'contraindicated', description: '' },
      ],
    });
    const score = computeProductRiskScore(product);
    // schedule: 15, interactions: min((4+4+4)*5, 40) = 40, controlled: 0 => 55
    expect(score).toBe(55);
  });

  it('never exceeds 100', () => {
    const product = makeProduct({
      schedule: 'I',
      isControlled: true,
      interactions: [
        { drugName: 'A', severity: 'contraindicated', description: '' },
        { drugName: 'B', severity: 'contraindicated', description: '' },
        { drugName: 'C', severity: 'contraindicated', description: '' },
      ],
    });
    const score = computeProductRiskScore(product);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('getTopRiskProducts', () => {
  it('returns products sorted by risk score descending', () => {
    const low = makeProduct({ id: 'low', schedule: 'unscheduled', name: 'Low Risk' });
    const high = makeProduct({ id: 'high', schedule: 'I', isControlled: true, name: 'High Risk' });
    const mid = makeProduct({ id: 'mid', schedule: 'III', name: 'Mid Risk' });

    const result = getTopRiskProducts([low, high, mid], 10);

    expect(result).toHaveLength(3);
    expect(result[0].product.id).toBe('high');
    expect(result[1].product.id).toBe('mid');
    expect(result[2].product.id).toBe('low');
  });

  it('limits to N products', () => {
    const products = Array.from({ length: 15 }, (_, i) =>
      makeProduct({ id: `p${i}` }),
    );
    const result = getTopRiskProducts(products, 10);
    expect(result).toHaveLength(10);
  });

  it('returns empty array for empty input', () => {
    expect(getTopRiskProducts([], 10)).toEqual([]);
  });

  it('includes correct risk levels', () => {
    const critical = makeProduct({ schedule: 'II' });
    const low = makeProduct({ schedule: 'unscheduled' });

    const result = getTopRiskProducts([critical, low], 10);
    expect(result[0].riskLevel).toBe('critical');
    expect(result[1].riskLevel).toBe('low');
  });

  it('sorts products with interactions higher than those without', () => {
    const withInteractions = makeProduct({
      id: 'with',
      schedule: 'unscheduled',
      interactions: [
        { drugName: 'X', severity: 'major', description: '' },
        { drugName: 'Y', severity: 'major', description: '' },
      ],
    });
    const without = makeProduct({ id: 'without', schedule: 'unscheduled' });

    const result = getTopRiskProducts([without, withInteractions], 10);
    expect(result[0].product.id).toBe('with');
    expect(result[0].riskScore).toBeGreaterThan(result[1].riskScore);
  });
});

describe('findBAAGaps', () => {
  it('returns categories with no BAA-eligible product', () => {
    const products = [
      makeProduct({ category: 'analgesic', requiresPrescription: true, isAvailable: true }),
      makeProduct({ category: 'antibiotic', requiresPrescription: false, isAvailable: true }),
    ];
    const gaps = findBAAGaps(products);
    expect(gaps).toHaveLength(1);
    expect(gaps[0].category).toBe('antibiotic');
  });

  it('returns empty when all categories have BAA-eligible products', () => {
    const products = [
      makeProduct({ category: 'analgesic', requiresPrescription: true, isAvailable: true }),
      makeProduct({ category: 'antibiotic', requiresPrescription: true, isAvailable: true }),
    ];
    expect(findBAAGaps(products)).toHaveLength(0);
  });

  it('considers unavailable products as not BAA-eligible', () => {
    const products = [
      makeProduct({ category: 'neurological', requiresPrescription: true, isAvailable: false }),
    ];
    const gaps = findBAAGaps(products);
    expect(gaps).toHaveLength(1);
    expect(gaps[0].category).toBe('neurological');
  });

  it('returns gaps sorted alphabetically by label', () => {
    const products = [
      makeProduct({ category: 'respiratory', requiresPrescription: false, isAvailable: true }),
      makeProduct({ category: 'cardiovascular', requiresPrescription: false, isAvailable: true }),
      makeProduct({ category: 'analgesic', requiresPrescription: false, isAvailable: true }),
    ];
    const gaps = findBAAGaps(products);
    expect(gaps.map((g) => g.category)).toEqual([
      'analgesic',
      'cardiovascular',
      'respiratory',
    ]);
  });
});

describe('computeAggregateMetrics', () => {
  it('returns zeroed metrics for empty products', () => {
    const metrics = computeAggregateMetrics([]);
    expect(metrics.overallScore).toBe(0);
    expect(metrics.highestRiskCategory).toBeNull();
    expect(metrics.highRiskCountryPct).toBe(0);
    expect(metrics.totalProducts).toBe(0);
    expect(metrics.criticalCount).toBe(0);
    expect(metrics.highCount).toBe(0);
  });

  it('computes correct overall score as average of product risk scores', () => {
    const p1 = makeProduct({ schedule: 'unscheduled' }); // score 15
    const p2 = makeProduct({ schedule: 'I', isControlled: true }); // score 70
    const metrics = computeAggregateMetrics([p1, p2]);
    expect(metrics.overallScore).toBe(Math.round((15 + 70) / 2));
  });

  it('identifies highest risk therapeutic category', () => {
    const products = [
      makeProduct({ category: 'analgesic', schedule: 'I' }),
      makeProduct({ category: 'antibiotic', schedule: 'unscheduled' }),
    ];
    const metrics = computeAggregateMetrics(products);
    expect(metrics.highestRiskCategory?.category).toBe('analgesic');
  });

  it('computes high-risk product percentage', () => {
    const products = [
      makeProduct({ schedule: 'I' }),  // critical
      makeProduct({ schedule: 'III' }), // high
      makeProduct({ schedule: 'unscheduled' }), // low
      makeProduct({ schedule: 'V' }),   // low
    ];
    const metrics = computeAggregateMetrics(products);
    // 2 out of 4 are high/critical = 50%
    expect(metrics.highRiskCountryPct).toBe(50);
  });

  it('counts critical and high products separately', () => {
    const products = [
      makeProduct({ schedule: 'I' }),
      makeProduct({ schedule: 'II' }),
      makeProduct({ schedule: 'III' }),
      makeProduct({ schedule: 'IV' }),
    ];
    const metrics = computeAggregateMetrics(products);
    expect(metrics.criticalCount).toBe(2);
    expect(metrics.highCount).toBe(1);
  });
});
