import type { DrugProduct } from '@/types';

const PRODUCTS_KEY = 'iremedy:products';

export function loadProducts(): DrugProduct[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    return raw ? (JSON.parse(raw) as DrugProduct[]) : [];
  } catch {
    console.error('Failed to load products from localStorage');
    return [];
  }
}

export function saveProducts(products: DrugProduct[]): void {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch {
    console.error('Failed to save products to localStorage');
  }
}

export function clearProducts(): void {
  localStorage.removeItem(PRODUCTS_KEY);
}
