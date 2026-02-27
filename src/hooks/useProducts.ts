import { useMemo, useCallback } from 'react';
import { useProductStore } from '@/store';
import { saveProducts } from '@/services/persistence';
import type { DrugProduct } from '@/types';

export function useProducts() {
  const products = useProductStore((s) => s.products);
  const storeAddProduct = useProductStore((s) => s.addProduct);
  const storeRemoveProduct = useProductStore((s) => s.removeProduct);

  const addProduct = useCallback(
    (product: DrugProduct) => {
      storeAddProduct(product);
      // Persist after adding — read latest state from store
      const updated = useProductStore.getState().products;
      saveProducts([...updated, product]);
    },
    [storeAddProduct],
  );

  const removeProduct = useCallback(
    (id: string) => {
      storeRemoveProduct(id);
      const updated = useProductStore.getState().products;
      saveProducts(updated.filter((p) => p.id !== id));
    },
    [storeRemoveProduct],
  );

  const getById = useCallback(
    (id: string): DrugProduct | undefined => {
      return products.find((p) => p.id === id);
    },
    [products],
  );

  const baaEligible = useMemo(
    () => products.filter((p) => p.productType === 'prescription' && p.isAvailable),
    [products],
  );

  const highRisk = useMemo(
    () => products.filter((p) => p.isControlled || p.interactions.length > 0),
    [products],
  );

  const averageMIA = useMemo(() => {
    if (products.length === 0) return 0;
    const totalInteractions = products.reduce(
      (sum, p) => sum + p.interactions.length,
      0,
    );
    return totalInteractions / products.length;
  }, [products]);

  const productsByCountry = useMemo(() => {
    const map = new Map<string, DrugProduct[]>();
    for (const product of products) {
      const country = product.labelerName || 'Unknown';
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
