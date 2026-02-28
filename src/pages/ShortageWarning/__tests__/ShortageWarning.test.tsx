import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useProductStore } from '@/store';
import type { DrugProduct } from '@/types';
import ShortageWarning, {
  computeRiskFactors,
  isShortageProduct,
  shortageRiskLevel,
} from '../ShortageWarning';

function makeProduct(overrides: Partial<DrugProduct> & { id: string; name: string }): DrugProduct {
  return {
    ndc: '00000-0000-00',
    brandName: overrides.name,
    genericName: overrides.name,
    labelerName: 'Test Lab',
    manufacturer: 'Test Manufacturer, USA',
    productType: 'prescription',
    category: 'cardiovascular',
    schedule: 'unscheduled',
    routeOfAdministration: 'oral',
    dosageForm: 'Tablet',
    strength: '10',
    strengthUnit: 'mg',
    packageSize: '30',
    packageType: 'Bottle',
    description: 'Test drug product',
    activeIngredients: [{ name: 'TestDrug', strength: '10', unit: 'mg' }],
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
    price: 10.0,
    currency: 'USD',
    fdaApprovalDate: '2020-01-01',
    lotNumber: 'LOT-001',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('computeRiskFactors', () => {
  const categoryCount = new Map([['cardiovascular', 3], ['antibiotic', 1]]);

  it('flags unavailable products', () => {
    const product = makeProduct({ id: '1', name: 'Test', isAvailable: false });
    const factors = computeRiskFactors(product, categoryCount);
    expect(factors.isUnavailable).toBe(true);
  });

  it('flags high-risk country manufacturers', () => {
    const product = makeProduct({
      id: '1',
      name: 'Test',
      manufacturer: 'Shanghai Pharma, China',
    });
    const factors = computeRiskFactors(product, categoryCount);
    expect(factors.highRiskCountry).toBe(true);
  });

  it('does not flag US manufacturers as high-risk', () => {
    const product = makeProduct({
      id: '1',
      name: 'Test',
      manufacturer: 'Pfizer Inc., USA',
    });
    const factors = computeRiskFactors(product, categoryCount);
    expect(factors.highRiskCountry).toBe(false);
  });

  it('flags products with 2+ warnings as recall risk', () => {
    const product = makeProduct({
      id: '1',
      name: 'Test',
      warnings: ['Warning A', 'Warning B'],
    });
    const factors = computeRiskFactors(product, categoryCount);
    expect(factors.recentRecallRisk).toBe(true);
  });

  it('flags single-source products', () => {
    const product = makeProduct({
      id: '1',
      name: 'Test',
      category: 'antibiotic',
    });
    const factors = computeRiskFactors(product, categoryCount);
    expect(factors.singleSource).toBe(true);
  });

  it('flags products missing FDA date or lot number', () => {
    const product = makeProduct({
      id: '1',
      name: 'Test',
      fdaApprovalDate: undefined,
      lotNumber: undefined,
    });
    const factors = computeRiskFactors(product, categoryCount);
    expect(factors.lowComplianceScore).toBe(true);
  });
});

describe('isShortageProduct', () => {
  it('returns true for unavailable products', () => {
    const factors = {
      isUnavailable: true,
      highRiskCountry: false,
      recentRecallRisk: false,
      singleSource: false,
      lowComplianceScore: false,
    };
    expect(isShortageProduct(factors)).toBe(true);
  });

  it('returns true when 2+ risk factors are present', () => {
    const factors = {
      isUnavailable: false,
      highRiskCountry: true,
      recentRecallRisk: true,
      singleSource: false,
      lowComplianceScore: false,
    };
    expect(isShortageProduct(factors)).toBe(true);
  });

  it('returns false when only 1 risk factor is present', () => {
    const factors = {
      isUnavailable: false,
      highRiskCountry: true,
      recentRecallRisk: false,
      singleSource: false,
      lowComplianceScore: false,
    };
    expect(isShortageProduct(factors)).toBe(false);
  });

  it('returns false when no risk factors are present', () => {
    const factors = {
      isUnavailable: false,
      highRiskCountry: false,
      recentRecallRisk: false,
      singleSource: false,
      lowComplianceScore: false,
    };
    expect(isShortageProduct(factors)).toBe(false);
  });
});

describe('shortageRiskLevel', () => {
  it('returns critical for unavailable products', () => {
    expect(
      shortageRiskLevel({
        isUnavailable: true,
        highRiskCountry: false,
        recentRecallRisk: false,
        singleSource: false,
        lowComplianceScore: false,
      }),
    ).toBe('critical');
  });

  it('returns critical for 3+ risk factors', () => {
    expect(
      shortageRiskLevel({
        isUnavailable: false,
        highRiskCountry: true,
        recentRecallRisk: true,
        singleSource: true,
        lowComplianceScore: false,
      }),
    ).toBe('critical');
  });

  it('returns high for 2 risk factors', () => {
    expect(
      shortageRiskLevel({
        isUnavailable: false,
        highRiskCountry: true,
        recentRecallRisk: true,
        singleSource: false,
        lowComplianceScore: false,
      }),
    ).toBe('high');
  });

  it('returns moderate for 1 risk factor', () => {
    expect(
      shortageRiskLevel({
        isUnavailable: false,
        highRiskCountry: true,
        recentRecallRisk: false,
        singleSource: false,
        lowComplianceScore: false,
      }),
    ).toBe('moderate');
  });

  it('returns low for no risk factors', () => {
    expect(
      shortageRiskLevel({
        isUnavailable: false,
        highRiskCountry: false,
        recentRecallRisk: false,
        singleSource: false,
        lowComplianceScore: false,
      }),
    ).toBe('low');
  });
});

describe('ShortageWarning component', () => {
  beforeEach(() => {
    useProductStore.setState({ products: [], isLoaded: true, isLoading: false });
  });

  it('shows empty portfolio message when no products exist', () => {
    render(<ShortageWarning />);
    expect(screen.getByTestId('no-products')).toBeInTheDocument();
  });

  it('shows no-shortages message when all products are healthy', () => {
    const healthyProducts = [
      makeProduct({ id: 'p1', name: 'Product A', category: 'cardiovascular' }),
      makeProduct({ id: 'p2', name: 'Product B', category: 'cardiovascular' }),
    ];
    useProductStore.setState({ products: healthyProducts });
    render(<ShortageWarning />);
    expect(screen.getByTestId('no-shortages')).toBeInTheDocument();
    expect(
      screen.getByText('No active shortages in your tracked portfolio'),
    ).toBeInTheDocument();
  });

  it('correctly identifies shortage-flagged products', () => {
    const products = [
      makeProduct({ id: 'p1', name: 'Healthy Drug', category: 'cardiovascular' }),
      makeProduct({ id: 'p2', name: 'Another Healthy', category: 'cardiovascular' }),
      makeProduct({
        id: 'p3',
        name: 'China Drug',
        manufacturer: 'Shanghai Pharma, China',
        warnings: ['W1', 'W2'],
        category: 'antibiotic',
      }),
      makeProduct({
        id: 'p4',
        name: 'Unavailable Drug',
        isAvailable: false,
        category: 'endocrine',
      }),
    ];
    useProductStore.setState({ products });
    render(<ShortageWarning />);

    expect(screen.getByTestId('shortage-warning-page')).toBeInTheDocument();
    const items = screen.getAllByTestId('shortage-product-item');
    expect(items).toHaveLength(2);
    expect(screen.getByText('China Drug')).toBeInTheDocument();
    expect(screen.getByText('Unavailable Drug')).toBeInTheDocument();
  });

  it('displays risk tags for flagged products', () => {
    const products = [
      makeProduct({
        id: 'p1',
        name: 'Risky Drug',
        manufacturer: 'Beijing Pharma, China',
        warnings: ['W1', 'W2'],
        category: 'analgesic',
      }),
    ];
    useProductStore.setState({ products });
    render(<ShortageWarning />);

    const tags = screen.getAllByTestId('risk-tag');
    const tagTexts = tags.map((t) => t.textContent);
    expect(tagTexts).toContain('High-Risk Country');
    expect(tagTexts).toContain('Recall Indicators');
  });

  it('shows radar and alternatives when a product is selected', () => {
    const products = [
      makeProduct({
        id: 'p1',
        name: 'Shortage Drug',
        manufacturer: 'Zhejiang Pharma, China',
        warnings: ['W1', 'W2'],
        category: 'cardiovascular',
      }),
      makeProduct({ id: 'p2', name: 'Good Alternative', category: 'cardiovascular' }),
    ];
    useProductStore.setState({ products });
    render(<ShortageWarning />);

    fireEvent.click(screen.getByText('Shortage Drug'));
    expect(screen.getByTestId('shortage-radar')).toBeInTheDocument();
    expect(screen.getByTestId('alternative-tracker')).toBeInTheDocument();
  });
});
