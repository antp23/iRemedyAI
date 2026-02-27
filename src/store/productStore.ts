import { create } from 'zustand';
import type {
  DrugProduct,
  DEASchedule,
  RiskLevel,
} from '@/types';

// Persistence interface - services/persistence.ts will implement this
export interface ProductPersistence {
  loadProducts(): Promise<DrugProduct[]>;
  saveProducts(products: DrugProduct[]): Promise<void>;
}

// localStorage fallback persistence
const localStoragePersistence: ProductPersistence = {
  async loadProducts(): Promise<DrugProduct[]> {
    try {
      const data = localStorage.getItem('iremedy_products');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn('Failed to load products from localStorage:', error);
      return [];
    }
  },
  async saveProducts(products: DrugProduct[]): Promise<void> {
    try {
      localStorage.setItem('iremedy_products', JSON.stringify(products));
    } catch (error) {
      console.warn('Failed to save products to localStorage:', error);
    }
  },
};

// Active persistence layer — defaults to localStorage, can be swapped via setPersistence()
let persistence: ProductPersistence = localStoragePersistence;

/**
 * Replace the persistence backend. Call this at app startup before loadFromPersistence()
 * to inject the IndexedDB-backed implementation from services/persistence.ts.
 */
export function setPersistence(impl: ProductPersistence): void {
  persistence = impl;
}

// Map DEA schedules to risk levels
function scheduleToRiskLevel(schedule: DEASchedule): RiskLevel {
  switch (schedule) {
    case 'I':
    case 'II':
      return 'critical';
    case 'III':
      return 'high';
    case 'IV':
      return 'moderate';
    case 'V':
    case 'unscheduled':
      return 'low';
  }
}

interface ProductState {
  products: DrugProduct[];
  isLoaded: boolean;
  isLoading: boolean;
}

interface ProductActions {
  loadFromPersistence(): Promise<void>;
  addProduct(product: DrugProduct): void;
  removeProduct(id: string): void;
  updateProduct(id: string, updates: Partial<DrugProduct>): void;
  getProductById(id: string): DrugProduct | undefined;
  getProductsByRisk(riskLevel: RiskLevel): DrugProduct[];
  getProductsByCountry(country: string): DrugProduct[];
  getBAAEligible(): DrugProduct[];
  getAverageMIA(): number;
  searchProducts(query: string): DrugProduct[];
}

export type ProductStore = ProductState & ProductActions;

const persistProducts = (products: DrugProduct[]): void => {
  persistence.saveProducts(products).catch((error) => {
    console.warn('Product persistence failed, data kept in memory only:', error);
  });
};

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  isLoaded: false,
  isLoading: false,

  async loadFromPersistence() {
    if (get().isLoaded || get().isLoading) return;
    set({ isLoading: true });
    try {
      const products = await persistence.loadProducts();
      set({ products, isLoaded: true, isLoading: false });
    } catch (error) {
      console.warn('Failed to load products from persistence, data kept in memory only:', error);
      set({ isLoaded: true, isLoading: false });
    }
  },

  addProduct(product: DrugProduct) {
    set((state) => {
      const exists = state.products.some((p) => p.id === product.id);
      if (exists) return state;
      const products = [...state.products, product];
      persistProducts(products);
      return { products };
    });
  },

  removeProduct(id: string) {
    set((state) => {
      const products = state.products.filter((p) => p.id !== id);
      persistProducts(products);
      return { products };
    });
  },

  updateProduct(id: string, updates: Partial<DrugProduct>) {
    set((state) => {
      const products = state.products.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p,
      );
      persistProducts(products);
      return { products };
    });
  },

  getProductById(id: string): DrugProduct | undefined {
    return get().products.find((p) => p.id === id);
  },

  getProductsByRisk(riskLevel: RiskLevel): DrugProduct[] {
    return get().products.filter(
      (p) => scheduleToRiskLevel(p.schedule) === riskLevel,
    );
  },

  getProductsByCountry(country: string): DrugProduct[] {
    const query = country.toLowerCase();
    return get().products.filter(
      (p) =>
        p.manufacturer.toLowerCase().includes(query) ||
        p.labelerName.toLowerCase().includes(query),
    );
  },

  getBAAEligible(): DrugProduct[] {
    return get().products.filter(
      (p) => p.requiresPrescription && p.isAvailable,
    );
  },

  getAverageMIA(): number {
    const { products } = get();
    if (products.length === 0) return 0;

    const totalInteractionScore = products.reduce((sum, product) => {
      const severityWeights: Record<string, number> = {
        contraindicated: 4,
        major: 3,
        moderate: 2,
        minor: 1,
      };
      const interactionScore = product.interactions.reduce(
        (iSum, interaction) =>
          iSum + (severityWeights[interaction.severity] ?? 0),
        0,
      );
      return sum + interactionScore;
    }, 0);

    return Math.round((totalInteractionScore / products.length) * 100) / 100;
  },

  searchProducts(query: string): DrugProduct[] {
    const q = query.toLowerCase().trim();
    if (!q) return get().products;

    return get().products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brandName.toLowerCase().includes(q) ||
        p.genericName.toLowerCase().includes(q) ||
        p.ndc.toLowerCase().includes(q) ||
        p.manufacturer.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.activeIngredients.some((ai) =>
          ai.name.toLowerCase().includes(q),
        ),
    );
  },
}));
