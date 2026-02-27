import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useProducts } from '../useProducts';
import { useProductStore } from '@/store';
import type { DrugProduct } from '@/types';

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

describe('useProducts', () => {
  beforeEach(() => {
    useProductStore.getState().setProducts([]);
  });

  it('returns empty defaults when store is empty', () => {
    const { result } = renderHook(() => useProducts());

    expect(result.current.products).toEqual([]);
    expect(result.current.baaEligible).toEqual([]);
    expect(result.current.highRisk).toEqual([]);
    expect(result.current.averageMIA).toBe(0);
    expect(result.current.productsByCountry.size).toBe(0);
  });

  it('adds a product to the store', () => {
    const { result } = renderHook(() => useProducts());
    const product = makeProduct({ id: 'p1' });

    act(() => {
      result.current.addProduct(product);
    });

    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0].id).toBe('p1');
  });

  it('removes a product from the store', () => {
    const p1 = makeProduct({ id: 'p1' });
    const p2 = makeProduct({ id: 'p2' });

    useProductStore.getState().setProducts([p1, p2]);

    const { result } = renderHook(() => useProducts());
    expect(result.current.products).toHaveLength(2);

    act(() => {
      result.current.removeProduct('p1');
    });

    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0].id).toBe('p2');
  });

  it('getById returns the correct product', () => {
    const p1 = makeProduct({ id: 'p1', name: 'Aspirin' });
    const p2 = makeProduct({ id: 'p2', name: 'Ibuprofen' });

    useProductStore.getState().setProducts([p1, p2]);

    const { result } = renderHook(() => useProducts());

    expect(result.current.getById('p1')?.name).toBe('Aspirin');
    expect(result.current.getById('p2')?.name).toBe('Ibuprofen');
    expect(result.current.getById('nonexistent')).toBeUndefined();
  });

  it('computes baaEligible (prescription + available)', () => {
    const eligible = makeProduct({ productType: 'prescription', isAvailable: true });
    const otc = makeProduct({ productType: 'otc', isAvailable: true });
    const unavailable = makeProduct({ productType: 'prescription', isAvailable: false });

    useProductStore.getState().setProducts([eligible, otc, unavailable]);

    const { result } = renderHook(() => useProducts());
    expect(result.current.baaEligible).toHaveLength(1);
    expect(result.current.baaEligible[0].id).toBe(eligible.id);
  });

  it('computes highRisk (controlled or has interactions)', () => {
    const controlled = makeProduct({ isControlled: true });
    const hasInteractions = makeProduct({
      isControlled: false,
      interactions: [{ drugName: 'X', severity: 'major', description: 'test' }],
    });
    const safe = makeProduct({ isControlled: false, interactions: [] });

    useProductStore.getState().setProducts([controlled, hasInteractions, safe]);

    const { result } = renderHook(() => useProducts());
    expect(result.current.highRisk).toHaveLength(2);
  });

  it('computes averageMIA as average interaction count per product', () => {
    const p1 = makeProduct({
      interactions: [
        { drugName: 'A', severity: 'major', description: '' },
        { drugName: 'B', severity: 'minor', description: '' },
      ],
    });
    const p2 = makeProduct({ interactions: [] });

    useProductStore.getState().setProducts([p1, p2]);

    const { result } = renderHook(() => useProducts());
    expect(result.current.averageMIA).toBe(1); // (2 + 0) / 2
  });

  it('groups productsByCountry using labelerName', () => {
    const p1 = makeProduct({ labelerName: 'USA Labs' });
    const p2 = makeProduct({ labelerName: 'USA Labs' });
    const p3 = makeProduct({ labelerName: 'Canada Pharma' });

    useProductStore.getState().setProducts([p1, p2, p3]);

    const { result } = renderHook(() => useProducts());
    const map = result.current.productsByCountry;
    expect(map.get('USA Labs')).toHaveLength(2);
    expect(map.get('Canada Pharma')).toHaveLength(1);
  });

  it('memoizes derived values when products do not change', () => {
    const p1 = makeProduct();
    useProductStore.getState().setProducts([p1]);

    const { result, rerender } = renderHook(() => useProducts());
    const firstBaaEligible = result.current.baaEligible;
    const firstHighRisk = result.current.highRisk;
    const firstByCountry = result.current.productsByCountry;

    rerender();

    expect(result.current.baaEligible).toBe(firstBaaEligible);
    expect(result.current.highRisk).toBe(firstHighRisk);
    expect(result.current.productsByCountry).toBe(firstByCountry);
  });
});
