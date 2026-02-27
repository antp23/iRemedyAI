import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useSearch } from '../useSearch';
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

describe('useSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useProductStore.getState().setProducts([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty state initially', () => {
    const { result } = renderHook(() => useSearch());

    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.isSearching).toBe(false);
  });

  it('returns empty results when query is set but store is empty', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('aspirin');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.query).toBe('aspirin');
    expect(result.current.results).toEqual([]);
  });

  it('matches products by name', () => {
    const aspirin = makeProduct({ name: 'Aspirin 100mg' });
    const ibuprofen = makeProduct({ name: 'Ibuprofen 200mg' });
    useProductStore.getState().setProducts([aspirin, ibuprofen]);

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('aspirin');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].name).toBe('Aspirin 100mg');
  });

  it('matches products by NDC code', () => {
    const product = makeProduct({ ndc: '1234-5678-90' });
    useProductStore.getState().setProducts([product]);

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('1234');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.results).toHaveLength(1);
  });

  it('matches products by manufacturer', () => {
    const product = makeProduct({ manufacturer: 'Pfizer Inc' });
    useProductStore.getState().setProducts([product]);

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('pfizer');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.results).toHaveLength(1);
  });

  it('matches products by category (therapeutic class)', () => {
    const product = makeProduct({ category: 'cardiovascular' });
    useProductStore.getState().setProducts([product]);

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('cardio');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.results).toHaveLength(1);
  });

  it('is case-insensitive', () => {
    const product = makeProduct({ name: 'Aspirin' });
    useProductStore.getState().setProducts([product]);

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('ASPIRIN');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.results).toHaveLength(1);
  });

  it('clears results when query is emptied', () => {
    const product = makeProduct({ name: 'Aspirin' });
    useProductStore.getState().setProducts([product]);

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('aspirin');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.results).toHaveLength(1);

    act(() => {
      result.current.setQuery('');
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.isSearching).toBe(false);
  });

  it('shows isSearching while debouncing', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('test');
    });

    expect(result.current.isSearching).toBe(true);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.isSearching).toBe(false);
  });
});
