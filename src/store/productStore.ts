import { create } from 'zustand';
import type { DrugProduct } from '@/types';

export interface ProductState {
  products: DrugProduct[];
  addProduct: (product: DrugProduct) => void;
  removeProduct: (id: string) => void;
  setProducts: (products: DrugProduct[]) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  addProduct: (product) =>
    set((state) => ({ products: [...state.products, product] })),
  removeProduct: (id) =>
    set((state) => ({ products: state.products.filter((p) => p.id !== id) })),
  setProducts: (products) => set({ products }),
}));
