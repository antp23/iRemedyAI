import { useMemo, useCallback } from 'react';
import { useProductStore } from '@/store';
import type { DrugProduct, RiskLevel } from '@/types';

export function useProducts() {
  const products = useProductStore((s) => s.products);
  const storeAddProduct = useProductStore((s) => s.addProduct);
  const storeRemoveProduct = useProductStore((s) => s.removeProduct);

  const addProduct = useCallback(
    (product: DrugProduct) => {
      storeAddProduct(product);
    },
    [storeAddProduct],
  );

  const removeProduct = useCallback(
    (id: string) => {
      storeRemoveProduct(id);
    },
    [storeRemoveProduct],
  );

  const getById = useCallback(
    (id: string): DrugProduct | undefined => {
      return useProductStore.getState().getProductById(id);
    },
    [],
  );

  const baaEligible = useMemo(
    () => useProductStore.getState().getBAAEligible(),
    [products],
  );

  const highRisk = useMemo(
    () => useProductStore.getState().getProductsByRisk('critical' as RiskLevel),
    [products],
  );

  const averageMIA = useMemo(
    () => useProductStore.getState().getAverageMIA(),
    [products],
  );

  const productsByCountry = useMemo(() => {
    const map = new Map<string, DrugProduct[]>();
    for (const product of products) {
      const country = product.manufacturer || 'Unknown';
      const existing = map.get(country) ?? [];
      existing.push(product);
      map.set(country, existing);
    }
    return map;
  }, [products]);

  return {
    products,
    addProduct,
    removeProduct,
    getById,
    baaEligible,
    highRisk,
    averageMIA,
    productsByCountry,
  };
}
